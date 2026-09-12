import ExcelJS from "exceljs";
import {
  MAX_CELLS_PER_AGGREGATE,
  MAX_CELLS_PER_READ,
  MAX_ROWS_PER_AGGREGATE,
  MAX_ROWS_PER_READ,
} from "../limits";

export type AggregateOperation = "sum" | "average" | "count" | "min" | "max";

// Thin wrapper around an in-memory ExcelJS workbook. This is the only
// place that touches ExcelJS directly — the dispatcher and the agent
// loop only ever see these methods, never the library itself. That
// seam is what a future Word/PPT/CSV engine implements instead.
//
// The workbook this wraps is always a fresh parse of the uploaded
// bytes, held only in memory for the duration of one request — the
// original buffer is never written back to; toBuffer() produces a new
// buffer entirely.

export class ExcelEngineError extends Error {}

function parseRange(range: string): { startCol: number; startRow: number; endCol: number; endRow: number } {
  const [startRef, endRef] = range.includes(":") ? range.split(":") : [range, range];
  const start = splitCellRef(startRef);
  const end = splitCellRef(endRef);
  return {
    startCol: Math.min(start.col, end.col),
    endCol: Math.max(start.col, end.col),
    startRow: Math.min(start.row, end.row),
    endRow: Math.max(start.row, end.row),
  };
}

function splitCellRef(ref: string): { col: number; row: number } {
  const match = /^([A-Za-z]{1,3})([1-9][0-9]*)$/.exec(ref);
  if (!match) throw new ExcelEngineError(`Invalid cell reference: '${ref}'`);
  const [, colLetters, rowDigits] = match;
  let col = 0;
  for (const ch of colLetters.toUpperCase()) {
    col = col * 26 + (ch.charCodeAt(0) - 64);
  }
  return { col, row: parseInt(rowDigits, 10) };
}

export class ExcelEngine {
  private constructor(private workbook: ExcelJS.Workbook) {}

  static async fromBuffer(buffer: Buffer): Promise<ExcelEngine> {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    } catch (err) {
      throw new ExcelEngineError(
        `Could not read this file as an .xlsx workbook (${err instanceof Error ? err.message : "unknown error"})`
      );
    }
    return new ExcelEngine(workbook);
  }

  private getSheet(sheetName: string): ExcelJS.Worksheet {
    const sheet = this.workbook.getWorksheet(sheetName);
    if (!sheet) {
      const available = this.workbook.worksheets.map((s) => s.name).join(", ") || "(none)";
      throw new ExcelEngineError(`No sheet named '${sheetName}'. Available sheets: ${available}`);
    }
    return sheet;
  }

  inspectWorkbook() {
    return {
      sheets: this.workbook.worksheets.map((sheet) => ({
        name: sheet.name,
        usedRange:
          sheet.rowCount > 0 && sheet.columnCount > 0
            ? `A1:${columnLetter(sheet.columnCount)}${sheet.rowCount}`
            : null,
        rowCount: sheet.rowCount,
        columnCount: sheet.columnCount,
      })),
    };
  }

  readRange(sheetName: string, range: string) {
    const sheet = this.getSheet(sheetName);
    const { startCol, endCol, startRow, endRow } = parseRange(range);
    checkRangeSize(startRow, endRow, startCol, endCol, MAX_ROWS_PER_READ, MAX_CELLS_PER_READ, "read");

    const values: ExcelJS.CellValue[][] = [];
    for (let r = startRow; r <= endRow; r++) {
      const row: ExcelJS.CellValue[] = [];
      for (let c = startCol; c <= endCol; c++) {
        row.push(sheet.getCell(r, c).value);
      }
      values.push(row);
    }
    return { sheetName, range, values };
  }

  // Computes the aggregate itself, server-side, over raw numeric cell
  // values — the model never sees the individual numbers and never
  // does the arithmetic. Non-numeric and blank cells are skipped, the
  // same way a spreadsheet's own SUM/AVERAGE would treat them.
  aggregateRange(sheetName: string, range: string, operation: AggregateOperation) {
    const sheet = this.getSheet(sheetName);
    const { startCol, endCol, startRow, endRow } = parseRange(range);
    checkRangeSize(
      startRow,
      endRow,
      startCol,
      endCol,
      MAX_ROWS_PER_AGGREGATE,
      MAX_CELLS_PER_AGGREGATE,
      "aggregate"
    );

    let numericCount = 0;
    let ignoredCount = 0;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const value = sheet.getCell(r, c).value;
        if (typeof value === "number" && Number.isFinite(value)) {
          numericCount++;
          sum += value;
          if (value < min) min = value;
          if (value > max) max = value;
        } else {
          ignoredCount++;
        }
      }
    }

    let result: number | null;
    switch (operation) {
      case "count":
        result = numericCount; // valid even when 0
        break;
      case "sum":
        result = cleanFloat(sum); // matches spreadsheet SUM(empty range) = 0
        break;
      case "average":
        result = numericCount === 0 ? null : cleanFloat(sum / numericCount);
        break;
      case "min":
        result = numericCount === 0 ? null : cleanFloat(min);
        break;
      case "max":
        result = numericCount === 0 ? null : cleanFloat(max);
        break;
    }

    return { sheetName, range, operation, result, numericCount, ignoredCount };
  }

  writeCell(sheetName: string, cell: string, value: string | number | boolean | null) {
    const sheet = this.getSheet(sheetName);
    const { row, col } = splitCellRef(cell);
    sheet.getCell(row, col).value = value;
    return { sheetName, cell, value };
  }

  async toBuffer(): Promise<Buffer> {
    const arrayBuffer = await this.workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}

function checkRangeSize(
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
  maxRows: number,
  maxCells: number,
  label: string
): void {
  const rowSpan = endRow - startRow + 1;
  const colSpan = endCol - startCol + 1;
  if (rowSpan > maxRows) {
    throw new ExcelEngineError(`Range spans ${rowSpan} rows, which is over the ${maxRows}-row limit for a single ${label}. Narrow the range.`);
  }
  if (rowSpan * colSpan > maxCells) {
    throw new ExcelEngineError(`Range spans ${rowSpan * colSpan} cells, which is over the ${maxCells}-cell limit for a single ${label}. Narrow the range.`);
  }
}

// Strips floating-point noise (e.g. 9.750000000000002) without
// imposing a currency-style 2-decimal assumption on data that isn't
// money — 12 significant digits comfortably covers any value a
// spreadsheet-sized workbook would hold.
function cleanFloat(n: number): number {
  return Number(n.toPrecision(12));
}

function columnLetter(colNumber: number): string {
  let letters = "";
  let n = colNumber;
  while (n > 0) {
    const remainder = (n - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}
