import React, { useEffect, useState } from "react";
import "../assets/css/Game.css";

const GRID_SIZE = 4;

interface TilePosition {
    row: number;
    col: number;
}

class Game {
    private grid_: number[][];
    private score_: number;

    constructor() {
        this.grid_ = [];
        this.score_ = 0;
        this.reset();
    }

    reset() {
        this.grid_ = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
        this.score_ = 0;
        this.addRandomTile();
        this.addRandomTile();
    }

    private getRandomTilePosition(): TilePosition | null {
        const emptyTiles: TilePosition[] = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (this.grid_[row][col] === 0) {
                    emptyTiles.push({ row, col });
                }
            }
        }
        if (emptyTiles.length === 0) return null;
        return emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    }

    private addRandomTile() {
        const position = this.getRandomTilePosition();
        if (position) {
            this.grid_[position.row][position.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    private moveLeft(): boolean {
        let moved = false;
        for (let row = 0; row < GRID_SIZE; row++) {
            let newRow = this.grid_[row].filter((tile) => tile !== 0);
            for (let col = 0; col < newRow.length - 1; col++) {
                if (newRow[col] === newRow[col + 1]) {
                    newRow[col] *= 2;
                    this.score_ += newRow[col];
                    newRow[col + 1] = 0;
                    moved = true;
                }
            }
            newRow = newRow.filter((tile) => tile !== 0);
            while (newRow.length < GRID_SIZE) {
                newRow.push(0);
            }
            if (this.grid_[row].toString() !== newRow.toString()) {
                moved = true;
            }
            this.grid_[row] = newRow;
        }
        return moved;
    }

    private rotateGrid() {
        const newGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                newGrid[col][GRID_SIZE - row - 1] = this.grid_[row][col];
            }
        }
        this.grid_ = newGrid;
    }

    move(direction: number): boolean {
        let moved = false;

        if (direction === 0) {
            moved = this.moveLeft();
        } else if (direction === 1) {
            this.rotateGrid();
            this.rotateGrid();
            this.rotateGrid();
            moved = this.moveLeft();
            this.rotateGrid();
        } else if (direction === 2) {
            this.rotateGrid();
            this.rotateGrid();
            moved = this.moveLeft();
            this.rotateGrid();
            this.rotateGrid();
        } else if (direction === 3) {
            this.rotateGrid();
            moved = this.moveLeft();
            this.rotateGrid();
            this.rotateGrid();
            this.rotateGrid();
        }

        if (moved) {
            this.addRandomTile();
        }
        return moved;
    }

    canMove(): boolean {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (this.grid_[row][col] === 0) {
                    return true;
                }
                if (col < GRID_SIZE - 1 && this.grid_[row][col] === this.grid_[row][col + 1]) {
                    return true;
                }
                if (row < GRID_SIZE - 1 && this.grid_[row][col] === this.grid_[row + 1][col]) {
                    return true;
                }
            }
        }
        return false;
    }

    getGrid(): number[][] {
        return this.grid_;
    }

    getScore(): number {
        return this.score_;
    }
}

const GameComponent: React.FC = () => {
    const [game, setGame] = useState<Game>(new Game());
    const [grid, setGrid] = useState<number[][]>(game.getGrid());
    const [score, setScore] = useState<number>(game.getScore());

    const resetGame = () => {
        const newGame = new Game();
        setGame(newGame);
        setGrid(newGame.getGrid());
        setScore(newGame.getScore());
    };

    const handleKeyPress = (e: KeyboardEvent) => {
        let direction: number | null = null;
        switch (e.key) {
            case "ArrowLeft":
                direction = 0;
                break;
            case "ArrowUp":
                direction = 1;
                break;
            case "ArrowRight":
                direction = 2;
                break;
            case "ArrowDown":
                direction = 3;
                break;
            case "a":
                direction = 0;
                break;
            case "w":
                direction = 1;
                break;
            case "d":
                direction = 2;
                break;
            case "s":
                direction = 3;
                break;
            default:
                return;
        }

        if (direction !== null && game.move(direction)) {
            setGrid([...game.getGrid()]);
            setScore(game.getScore());
        }

        if (!game.canMove()) {
            resetGame();
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [game]);

    return (
        <div className="game-container">
            <div className="score-container">Score: {score}</div>
            <button onClick={resetGame} className="reset-button">Reset Game</button>
            <div className="grid-container">
                {grid.map((row, rowIndex) =>
                    row.map((tile, colIndex) => (
                        <div key={`${rowIndex}-${colIndex}`} className={`tile tile-${tile}`}>
                            {tile !== 0 ? tile : ""}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GameComponent;
