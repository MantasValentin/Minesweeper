import React, { useState, useEffect } from "react";
import "./App.scss";
import NumberDisplay from "./components/NumberDisplay";
import Button from "./components/Button";
import { generateCells, openCells } from "./utils";
import {
  MAX_COLS_B,
  MAX_COLS_E,
  MAX_COLS_I,
  MAX_ROWS_B,
  MAX_ROWS_E,
  MAX_ROWS_I,
  NO_OF_BOMBS_B,
  NO_OF_BOMBS_E,
  NO_OF_BOMBS_I,
} from "./constants";
import { Cell, CellState, CellValue, Face } from "./types";
import Scores from "./components/Scores";
import UserName from "./components/UserName";
import { addDoc, collection, doc, runTransaction } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCj6IHO1DuVe2697APlPD5dDJbZipBSnt8",
  authDomain: "mantasvalentin-portfolio-4f88d.firebaseapp.com",
  databaseURL:
    "https://mantasvalentin-portfolio-4f88d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mantasvalentin-portfolio-4f88d",
  storageBucket: "mantasvalentin-portfolio-4f88d.appspot.com",
  messagingSenderId: "839817407974",
  appId: "1:839817407974:web:4a200c1f03c48efc3aba27",
  measurementId: "G-HGPPN6K8P5",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

export { app, firestore };

const App: React.FC = () => {
  const [currentDiff, setCurrentDiff] = useState("beginner");
  const [userName, setUserName] = useState("");
  const [MAX_COLS, set_MAX_COLS] = useState<number>(MAX_COLS_B);
  const [MAX_ROWS, set_MAX_ROWS] = useState<number>(MAX_ROWS_B);
  const [NO_OF_BOMBS, set_NO_OF_BOMBS] = useState<number>(NO_OF_BOMBS_B);
  const [cells, setCells] = useState<Cell[][]>(
    generateCells(MAX_COLS, MAX_ROWS, NO_OF_BOMBS)
  );
  const [face, setFace] = useState<Face>(Face.smile);
  const [time, setTime] = useState<number>(0);
  const [live, setLive] = useState<boolean>(false);
  const [bombCounter, setBombCounter] = useState<number>(NO_OF_BOMBS);
  const [hasLost, setHasLost] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [difficultyChange, setDifficultyChange] = useState<boolean>(false);
  useEffect(() => {
    const handleMouseDown = () => {
      if (!hasWon && !hasLost) {
        setFace(Face.oh);
      }
    };

    const handleMouseUp = () => {
      if (!hasWon && !hasLost) {
        setFace(Face.smile);
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [hasWon, hasLost]);

  useEffect(() => {
    if (live && time < 999) {
      const timer = setInterval(() => setTime(time + 1), 1000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [live, time]);

  useEffect(() => {
    if (hasLost) {
      setFace(Face.lost);
      setLive(false);
    }
  }, [hasLost]);

  useEffect(() => {
    if (hasWon) {
      setFace(Face.won);
      setLive(false);
      handleAddScore();
    }
  }, [hasWon]);

  useEffect(() => {
    if (difficultyChange) {
      setDifficultyChange(false);
      handleFaceClick();
    }
  }, [difficultyChange]);

  useEffect(() => {
    if (userName === "") {
      setUserName(`user${Math.floor(100000 * Math.random())}`);
    }
  }, []);

  const handleAddScore = async () => {
    try {
      await addDoc(collection(firestore, "scores"), {
        score: time,
        name: userName,
        diff: currentDiff,
      });
    } catch (error) {
      console.log("Failed to add score", error);
    }
  };

  const handleCellClick = (rowParam: number, colParam: number) => (): void => {
    let newCells = cells.slice();

    if (!live && !hasLost && !hasWon) {
      let isBomb = newCells[rowParam][colParam].value === CellValue.bomb;
      while (isBomb) {
        newCells = generateCells(MAX_COLS, MAX_ROWS, NO_OF_BOMBS);
        if (newCells[rowParam][colParam].value !== CellValue.bomb) {
          isBomb = false;
          break;
        }
      }
      setLive(true);
    }

    const currentCell = newCells[rowParam][colParam];

    if (hasWon || hasLost) {
      return;
    } else if (
      currentCell.state === CellState.flagged ||
      currentCell.state === CellState.visible
    ) {
      return;
    }

    if (currentCell.value === CellValue.bomb) {
      setHasLost(true);
      newCells = showAllBombs(rowParam, colParam);
    } else if (currentCell.value === CellValue.none) {
      newCells = openCells(newCells, rowParam, colParam, MAX_COLS, MAX_ROWS);
    } else {
      newCells[rowParam][colParam].state = CellState.visible;
    }

    let safeHiddenCellsExist = false;
    for (let row = 0; row < MAX_ROWS; row++) {
      for (let col = 0; col < MAX_COLS; col++) {
        const currentCell = newCells[row][col];

        if (
          currentCell.value !== CellValue.bomb &&
          currentCell.state === CellState.hidden
        ) {
          safeHiddenCellsExist = true;
          break;
        }
      }
    }

    if (!safeHiddenCellsExist) {
      newCells = newCells.map((row) =>
        row.map((cell) => {
          if (cell.value === CellValue.bomb) {
            return {
              ...cell,
              state: CellState.flagged,
            };
          }
          return cell;
        })
      );
      setHasWon(true);
      setBombCounter(0);
    }

    setCells(newCells);
  };

  const handleCellContext =
    (rowParam: number, colParam: number) =>
    (e: React.MouseEvent): void => {
      e.preventDefault();
      if (live && !hasLost && !hasWon) {
        const currentCells = cells.slice();
        const currentCell = cells[rowParam][colParam];

        if (currentCell.state === CellState.visible) {
          return;
        } else if (currentCell.state === CellState.hidden) {
          currentCells[rowParam][colParam].state = CellState.flagged;
          setCells(currentCells);
          setBombCounter(bombCounter - 1);
        } else if (currentCell.state === CellState.flagged) {
          currentCells[rowParam][colParam].state = CellState.hidden;
          setCells(currentCells);
          setBombCounter(bombCounter + 1);
        }
      } else {
        return;
      }
    };

  const handleFaceClick = (): void => {
    if (live || hasLost || hasWon || difficultyChange) {
      setLive(false);
      setTime(0);
      setCells(generateCells(MAX_COLS, MAX_ROWS, NO_OF_BOMBS));
      setHasLost(false);
      setHasWon(false);
      setBombCounter(NO_OF_BOMBS);
      setFace(Face.smile);
    }
  };

  const renderCells = (): React.ReactNode => {
    return cells.map((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <Button
          key={`${rowIndex}-${colIndex}`}
          row={rowIndex}
          col={colIndex}
          state={cell.state}
          value={cell.value}
          red={cell.red}
          onClick={handleCellClick}
          onContext={handleCellContext}
        />
      ))
    );
  };

  const showAllBombs = (rowParam: number, colParam: number): Cell[][] => {
    const currentCells = cells.slice();
    return currentCells.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (cell.value === CellValue.bomb) {
          if (rowParam === rowIndex && colParam === colIndex) {
            return {
              value: CellValue.bomb,
              state: CellState.visible,
              red: true,
            };
          }
          return {
            value: CellValue.bomb,
            state: CellState.visible,
            red: false,
          };
        }
        return cell;
      })
    );
  };

  const changeDifficultyB = (): void => {
    setTimeout(() => {
      set_MAX_COLS(MAX_COLS_B);
      set_MAX_ROWS(MAX_ROWS_B);
      set_NO_OF_BOMBS(NO_OF_BOMBS_B);
      setCurrentDiff("beginner");
      setDifficultyChange(true);
    }, 0);
  };

  const changeDifficultyI = (): void => {
    setTimeout(() => {
      set_MAX_COLS(MAX_COLS_I);
      set_MAX_ROWS(MAX_ROWS_I);
      set_NO_OF_BOMBS(NO_OF_BOMBS_I);
      setCurrentDiff("intermediate");
      setDifficultyChange(true);
    }, 0);
  };

  const changeDifficultyE = (): void => {
    setTimeout(() => {
      set_MAX_COLS(MAX_COLS_E);
      set_MAX_ROWS(MAX_ROWS_E);
      set_NO_OF_BOMBS(NO_OF_BOMBS_E);
      setCurrentDiff("expert");
      setDifficultyChange(true);
    }, 0);
  };

  return (
    <div className="Structure">
      <div className="">
        <div className="Settings">
          <button className="Difficulty" onClick={changeDifficultyB}>
            Beginner
          </button>
          <button className="Difficulty" onClick={changeDifficultyI}>
            Intermediate
          </button>
          <button className="Difficulty" onClick={changeDifficultyE}>
            Expert
          </button>
        </div>
        <div className="App">
          <div className="Header">
            <NumberDisplay value={bombCounter} />
            <div className="Face" onClick={handleFaceClick}>
              <span role="img" aria-label="face">
                {face}
              </span>
            </div>
            <NumberDisplay value={time} />
          </div>
          <div
            className="Body"
            style={{
              display: "grid",
              gridTemplateRows: `repeat(${MAX_ROWS}, 1fr)`,
              gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)`,
            }}
          >
            {renderCells()}
          </div>
        </div>
      </div>
      <div className="User">
        <UserName userName={userName} setUserName={setUserName} />
        <Scores currentDiff={currentDiff} />
      </div>
    </div>
  );
};

export default App;
