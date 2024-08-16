const GRID_SIZE: number = 4;
const BITS_PER_CELL: number = 4;

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

    serialize(): bigint {
        let grid: bigint = 0n;

        for (let i: number = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            let row: number = Math.floor(i / GRID_SIZE);
            let col: number = i % GRID_SIZE;
            grid |= BigInt(this.grid_[row][col]) << BigInt(i * BITS_PER_CELL);
        }

        return grid;
    }

    deserialize(serializedGame: bigint): void {
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            let row = Math.floor(i / GRID_SIZE);
            let col = i % GRID_SIZE;
            this.grid_[row][col] = Number((serializedGame >> BigInt(i * BITS_PER_CELL)) & ((1n << BigInt(BITS_PER_CELL)) - 1n));
        }
    }

    static deserialize(serializedGame: bigint): Game {
        const game = new Game();
        game.deserialize(serializedGame);
        return game;
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
        this.serialize();
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

    clone(): Game {
        const newGame = new Game();
        newGame.grid_ = this.grid_.map(row => [...row]);
        newGame.score_ = this.score_;
        return newGame;
    }

    getGrid(): number[][] {
        return this.grid_;
    }

    getScore(): number {
        return this.score_;
    }
}

export { Game };