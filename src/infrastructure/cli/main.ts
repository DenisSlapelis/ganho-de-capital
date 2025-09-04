if (!process.env.LOG_LEVEL) process.env.LOG_LEVEL = 'INFO';

import { ProcessPortfolioUseCase } from '@use-cases';
import { logger } from '@utils';
import readline from 'readline';

const useCase = new ProcessPortfolioUseCase();

const nodeReadline = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});

logger.info('Application started \n');
logger.info('Enter a value: \n');

nodeReadline.on('line', function (line) {
    try {
        const orders = JSON.parse(line);

        if (!orders || typeof orders !== 'object') return logger.info('Invalid input');

        const result = useCase.execute(orders);

        return console.log(JSON.stringify(result));
    } catch (err) {
        logger.error('Error on read input:', err.message);
    }
});
