import { OrderType, OrderDTO, OrderOutputDTO } from '@dtos';
import { Portfolio } from '@entities';
import { BuyStrategy, SellStrategy, OrderStrategy } from '@strategies';
import { Order } from '@entities';
import { TaxCalculatorFactory } from '@tax';
import { logger } from '@utils';

export class ProcessPortfolioUseCase {
    private readonly strategyMap: Record<OrderType, OrderStrategy>;

    constructor() {
        this.strategyMap = {
            [OrderType.BUY]: new BuyStrategy(),
            [OrderType.SELL]: new SellStrategy(),
        };
    }

    execute(orders: Array<OrderDTO>): OrderOutputDTO[] {
        const portfolio = new Portfolio();
        const taxCalculatorFactory = new TaxCalculatorFactory();

        return orders.map((item) => {
            logger.debug('Order input: ', item);

            const order = new Order(item);

            const orderType = order.type;

            const strategy = this.strategyMap[orderType];

            if (!strategy) throw new Error(`Invalid type (${orderType})`);

            const taxCalculator = taxCalculatorFactory.getCalculator(orderType);

            const result = strategy.execute(order, portfolio, taxCalculator);

            logger.debug(`Order result: ${JSON.stringify(result)}\n`);

            return result;
        });
    }
}
