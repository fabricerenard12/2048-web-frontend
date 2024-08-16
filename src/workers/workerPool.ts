const MAX_WORKERS = navigator.hardwareConcurrency || 4;
const workerPool: Worker[] = [];

function createWorker(): Worker {
    return new Worker(new URL('./worker.ts', import.meta.url));
}

function getWorker(): Worker {
    if (workerPool.length > 0) {
        return workerPool.pop()!;
    } else if (workerPool.length < MAX_WORKERS) {
        return createWorker();
    } else {
        throw new Error('No available workers in the pool');
    }
}

function releaseWorker(worker: Worker) {
    workerPool.push(worker);
}

export { getWorker, releaseWorker };
