import { Game } from "../assets/ts/Game";

self.onmessage = async (event) => {
    const { game: serializedGame, iterations, numWorkers } = event.data;
    const game = Game.deserialize(serializedGame);
    
    try {
        const bestMove: number = await runMC(game, iterations, numWorkers);
        self.postMessage(bestMove);
    } catch (error) {
        console.error('Error in worker:', error);
    }
};

function runSimulations(game: Game, move: number, iterations: number): number {
    let score = 0;

    for (let i = 0; i < iterations; i++) {
        const tempGame = game.clone();
        tempGame.move(move);

        while (tempGame.canMove()) {
            const randomMove = Math.floor(Math.random() * 4);
            tempGame.move(randomMove);
        }

        score += tempGame.getScore();
    }

    return score;
}

async function runMC(game: Game, iterations: number, numWorkers: number): Promise<number> {
    const numMoves: number = 4;
    const simulationsPerMove: number = Math.floor(iterations / numMoves);
    const promises: Promise<{ move: number, score: number }>[] = [];

    for (let move = 0; move < numMoves; move++) {
        const workerSimulations = simulationsPerMove / numWorkers;

        for (let i = 0; i < numWorkers; i++) {
            promises.push(
                new Promise<{ move: number, score: number }>((resolve) => {
                    const score = runSimulations(game, move, workerSimulations);
                    resolve({ move, score });
                })
            );
        }
    }

    const results = await Promise.all(promises);
    const scores = Array(numMoves).fill(0);

    results.forEach(({ move, score }) => {
        scores[move] += score;
    });

    let bestMoveIndex = 0;
    let maxScore = scores[0];

    for (let i = 1; i < scores.length; i++) {
        if (scores[i] > maxScore) {
            maxScore = scores[i];
            bestMoveIndex = i;
        }
    }

    return bestMoveIndex;
}
