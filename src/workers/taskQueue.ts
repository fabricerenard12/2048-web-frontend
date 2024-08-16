import { Game } from "../assets/ts/Game";
import { getWorker, releaseWorker } from "./workerPool";

type Task = {
    game: Game;
    iterations: number;
    numWorkers: number;
    resolve: (bestMove: number) => void;
    reject: (error: any) => void;
};

const taskQueue: Task[] = [];
let isProcessing = false;

function processQueue() {
    if (isProcessing || taskQueue.length === 0) return;
    isProcessing = true;

    const worker = getWorker();
    const task = taskQueue.shift()!;
    const serializedGame = task.game.serialize();

    worker.postMessage({
        game: serializedGame,
        iterations: task.iterations,
        numWorkers: task.numWorkers
    });

    worker.onmessage = (event) => {
        const bestMove = event.data;
        task.resolve(bestMove);
        releaseWorker(worker);
        isProcessing = false;
        processQueue();
    };

    worker.onerror = (error) => {
        task.reject(error);
        releaseWorker(worker);
        isProcessing = false;
        processQueue();
    };
}

function addTask(game: Game, iterations: number, numWorkers: number): Promise<number> {
    return new Promise((resolve, reject) => {
        taskQueue.push({ game, iterations, numWorkers, resolve, reject });
        processQueue();
    });
}

export { addTask };
