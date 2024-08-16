import React, { useEffect, useState } from "react";
import "../assets/css/Game.css";
import { Game } from "../assets/ts/Game";
import { getWorker, releaseWorker } from "../workers/workerPool";
import { addTask } from "../workers/taskQueue";

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

    // const sendDataToServer = () => {
    //     const grid: bigint = game.serialize();

    //     const gridData = new GridData();
    //     gridData.setGrid(Number(grid & 0xFFFFFFFFFFFFFFFFn));
    //     const binaryData = gridData.serializeBinary();
    
    //     const socket = new WebSocket('ws://your-server-url');
    
    //     socket.onopen = () => {
    //         console.log('WebSocket connection opened');
    //         socket.send(binaryData);
    //     };
    
    //     socket.onmessage = (event) => {
    //         console.log('Message from server', event.data);
    //     };
    
    //     socket.onerror = (error) => {
    //         console.error('WebSocket error', error);
    //     };
    
    //     socket.onclose = () => {
    //         console.log('WebSocket connection closed');
    //     };
    // };


    const findBestMove = () => {
        addTask(game, 300, navigator.hardwareConcurrency)
            .then((bestMove) => {
                console.log(`Best move determined by MC: ${bestMove}`);
                game.move(bestMove);
                setGrid([...game.getGrid()]);
                setScore(game.getScore());
            })
            .catch((error) => {
                console.error('Error in finding the best move', error);
            });
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
            case " ":
                findBestMove();
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
