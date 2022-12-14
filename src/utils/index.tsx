import React from "react";
import { CellValue, CellState, Cell } from "../types";

const grabAllAdjacentCells = (
  cells: Cell[][],
  rowParam: number,
  colParam: number,
  MAX_COLS: number,
  MAX_ROWS: number
): {
  topLeftCell: Cell | null;
  topCell: Cell | null;
  topRightCell: Cell | null;
  leftCell: Cell | null;
  rightCell: Cell | null;
  bottomLeftCell: Cell | null;
  bottomCell: Cell | null;
  bottomRightCell: Cell | null;
} => {
  const topLeftCell =
    rowParam > 0 && colParam > 0 ? cells[rowParam - 1][colParam - 1] : null;
  const topCell = rowParam > 0 ? cells[rowParam - 1][colParam] : null;
  const topRightCell =
    rowParam > 0 && colParam < MAX_COLS - 1
      ? cells[rowParam - 1][colParam + 1]
      : null;
  const leftCell = colParam > 0 ? cells[rowParam][colParam - 1] : null;
  const rightCell =
    colParam < MAX_COLS - 1 ? cells[rowParam][colParam + 1] : null;
  const bottomLeftCell =
    rowParam < MAX_ROWS - 1 && colParam > 0
      ? cells[rowParam + 1][colParam - 1]
      : null;
  const bottomCell =
    rowParam < MAX_ROWS - 1 ? cells[rowParam + 1][colParam] : null;
  const bottomRightCell =
    rowParam < MAX_ROWS - 1 && colParam < MAX_COLS - 1
      ? cells[rowParam + 1][colParam + 1]
      : null;
  return {
    topLeftCell,
    topCell,
    topRightCell,
    leftCell,
    rightCell,
    bottomLeftCell,
    bottomCell,
    bottomRightCell,
  };
};

export const generateCells = (
  MAX_COLS: number,
  MAX_ROWS: number,
  NO_OF_BOMBS: number
): Cell[][] => {
  let cells: Cell[][] = [];

  for (let row = 0; row < MAX_ROWS; row++) {
    cells.push([]);
    for (let col = 0; col < MAX_COLS; col++) {
      cells[row].push({
        value: CellValue.none,
        state: CellState.hidden,
        red: false,
      });
    }
  }

  let bombsPlaced = 0;

  while (bombsPlaced < NO_OF_BOMBS) {
    const randomRow = Math.floor(Math.random() * MAX_ROWS);
    const randomCol = Math.floor(Math.random() * MAX_COLS);

    const currentCell = cells[randomRow][randomCol];
    if (currentCell.value === CellValue.bomb) {
      continue;
    } else {
      // cells[randomRow][randomCol] = {...cells[randomRow][randomCol], value: CellValue.bomb}
      cells = cells.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (randomRow === rowIndex && randomCol === colIndex) {
            return {
              ...cell,
              value: CellValue.bomb,
              red: false,
            };
          }

          return cell;
        })
      );
      bombsPlaced++;
    }
  }

  for (let rowIndex = 0; rowIndex < MAX_ROWS; rowIndex++) {
    for (let colIndex = 0; colIndex < MAX_COLS; colIndex++) {
      const currentCell = cells[rowIndex][colIndex];
      if (currentCell.value === CellValue.bomb) {
        continue;
      }

      let numberOfBombs = 0;
      const {
        topLeftCell,
        topCell,
        topRightCell,
        leftCell,
        rightCell,
        bottomLeftCell,
        bottomCell,
        bottomRightCell,
      } = grabAllAdjacentCells(cells, rowIndex, colIndex, MAX_COLS, MAX_ROWS);

      if (topLeftCell?.value === CellValue.bomb) {
        numberOfBombs++;
      }
      if (topCell?.value === CellValue.bomb) {
        numberOfBombs++;
      }
      if (topRightCell?.value === CellValue.bomb) {
        numberOfBombs++;
      }
      if (leftCell?.value === CellValue.bomb) {
        numberOfBombs++;
      }
      if (rightCell?.value === CellValue.bomb) {
        numberOfBombs++;
      }
      if (bottomLeftCell?.value === CellValue.bomb) {
        numberOfBombs++;
      }
      if (bottomCell?.value === CellValue.bomb) {
        numberOfBombs++;
      }
      if (bottomRightCell?.value === CellValue.bomb) {
        numberOfBombs++;
      }

      if (numberOfBombs > 0) {
        cells[rowIndex][colIndex] = {
          ...currentCell,
          value: numberOfBombs,
        };
      }
    }
  }

  return cells;
};

export const openCells = (
  cells: Cell[][],
  rowParam: number,
  colParam: number,
  MAX_COLS: number,
  MAX_ROWS: number
): Cell[][] => {
  let newCells = cells.slice();
  const currentCell = cells[rowParam][colParam];

  if (
    currentCell.state === CellState.visible ||
    currentCell.state === CellState.flagged
  ) {
    return newCells;
  }

  newCells[rowParam][colParam].state = CellState.visible;

  const {
    topLeftCell,
    topCell,
    topRightCell,
    leftCell,
    rightCell,
    bottomLeftCell,
    bottomCell,
    bottomRightCell,
  } = grabAllAdjacentCells(cells, rowParam, colParam, MAX_COLS, MAX_ROWS);

  if (topLeftCell?.state === CellState.hidden) {
    if (topLeftCell.value === CellValue.none) {
      newCells = openCells(
        newCells,
        rowParam - 1,
        colParam - 1,
        MAX_COLS,
        MAX_ROWS
      );
    } else {
      newCells[rowParam - 1][colParam - 1].state = CellState.visible;
    }
  }

  if (topCell?.state === CellState.hidden) {
    if (topCell.value === CellValue.none) {
      newCells = openCells(
        newCells,
        rowParam - 1,
        colParam,
        MAX_COLS,
        MAX_ROWS
      );
    } else {
      newCells[rowParam - 1][colParam].state = CellState.visible;
    }
  }

  if (topRightCell?.state === CellState.hidden) {
    if (topRightCell.value === CellValue.none) {
      newCells = openCells(
        newCells,
        rowParam - 1,
        colParam + 1,
        MAX_COLS,
        MAX_ROWS
      );
    } else {
      newCells[rowParam - 1][colParam + 1].state = CellState.visible;
    }
  }

  if (leftCell?.state === CellState.hidden) {
    if (leftCell.value === CellValue.none) {
      newCells = openCells(
        newCells,
        rowParam,
        colParam - 1,
        MAX_COLS,
        MAX_ROWS
      );
    } else {
      newCells[rowParam][colParam - 1].state = CellState.visible;
    }
  }

  if (rightCell?.state === CellState.hidden) {
    if (rightCell.value === CellValue.none) {
      newCells = openCells(
        newCells,
        rowParam,
        colParam + 1,
        MAX_COLS,
        MAX_ROWS
      );
    } else {
      newCells[rowParam][colParam + 1].state = CellState.visible;
    }
  }

  if (bottomLeftCell?.state === CellState.hidden) {
    if (bottomLeftCell.value === CellValue.none) {
      newCells = openCells(
        newCells,
        rowParam + 1,
        colParam - 1,
        MAX_COLS,
        MAX_ROWS
      );
    } else {
      newCells[rowParam + 1][colParam - 1].state = CellState.visible;
    }
  }

  if (bottomCell?.state === CellState.hidden) {
    if (bottomCell.value === CellValue.none) {
      newCells = openCells(
        newCells,
        rowParam + 1,
        colParam,
        MAX_COLS,
        MAX_ROWS
      );
    } else {
      newCells[rowParam + 1][colParam].state = CellState.visible;
    }
  }

  if (bottomRightCell?.state === CellState.hidden) {
    if (bottomRightCell.value === CellValue.none) {
      newCells = openCells(
        newCells,
        rowParam + 1,
        colParam + 1,
        MAX_COLS,
        MAX_ROWS
      );
    } else {
      newCells[rowParam + 1][colParam + 1].state = CellState.visible;
    }
  }

  return newCells;
};
