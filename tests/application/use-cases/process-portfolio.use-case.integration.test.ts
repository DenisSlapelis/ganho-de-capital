import { ProcessPortfolioUseCase } from '@use-cases';
import { OrderType, OrderDTO } from '@dtos';
import { SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX } from '@domain-constants';

describe('[INTEGRATION TEST] ProcessPortfolioUseCase', () => {
    const useCase = new ProcessPortfolioUseCase();

    beforeAll(() => {
        process.env.LOG_LEVEL = 'INFO';
    });

    it(`Case #1 - Should correctly calculate the tax on orders when the profit is less than ${SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX}`, () => {
        const orders: OrderDTO[] = [
            { operation: OrderType.BUY, 'unit-cost': 10.0, 'quantity': 100 },
            { operation: OrderType.SELL, 'unit-cost': 15.0, 'quantity': 50 },
            { operation: OrderType.SELL, 'unit-cost': 15.0, 'quantity': 50 },
        ];

        const results = useCase.execute(orders);

        expect(results).toHaveLength(orders.length);

        results.forEach((result) => {
            expect(result).toHaveProperty('tax');
        });

        expect(results[0].tax).toBe(0);
        expect(results[1].tax).toBe(0);
        expect(results[2].tax).toBe(0);
    });

    it('Case #2 - Should correctly calculate the tax on orders when there is a loss after profit', () => {
        const orders: OrderDTO[] = [
            { operation: OrderType.BUY, 'unit-cost': 10.0, 'quantity': 10000 },
            { operation: OrderType.SELL, 'unit-cost': 20.0, 'quantity': 5000 },
            { operation: OrderType.SELL, 'unit-cost': 5.0, 'quantity': 5000 },
        ];

        const results = useCase.execute(orders);

        expect(results).toHaveLength(orders.length);

        results.forEach((result) => {
            expect(result).toHaveProperty('tax');
        });

        expect(results[0].tax).toBe(0);
        expect(results[1].tax).toBe(10000);
        expect(results[2].tax).toBe(0);
    });

    it('Case #3 - Should correctly calculate the tax on orders when there is a sequence of profits that are less than the losses', () => {
        const orders: OrderDTO[] = [
            { operation: OrderType.BUY, 'unit-cost': 10.0, 'quantity': 10000 },
            { operation: OrderType.SELL, 'unit-cost': 5.0, 'quantity': 5000 },
            { operation: OrderType.SELL, 'unit-cost': 20.0, 'quantity': 3000 },
        ];

        const results = useCase.execute(orders);

        expect(results).toHaveLength(orders.length);

        results.forEach((result) => {
            expect(result).toHaveProperty('tax');
        });

        expect(results[0].tax).toBe(0);
        expect(results[1].tax).toBe(0);
        expect(results[2].tax).toBe(1000);
    });

    it('Case #4 - Should correctly calculate the tax on orders when there is neither profit nor loss', () => {
        const orders: OrderDTO[] = [
            { operation: OrderType.BUY, 'unit-cost': 10.0, 'quantity': 10000 },
            { operation: OrderType.BUY, 'unit-cost': 25.0, 'quantity': 5000 },
            { operation: OrderType.SELL, 'unit-cost': 15.0, 'quantity': 10000 },
        ];

        const results = useCase.execute(orders);

        expect(results).toHaveLength(orders.length);

        results.forEach((result) => {
            expect(result).toHaveProperty('tax');
        });

        expect(results[0].tax).toBe(0);
        expect(results[1].tax).toBe(0);
        expect(results[2].tax).toBe(0);
    });

    it('Case #5 - Should correctly calculate the tax on orders when there is no profit after a change in the average price and a profit without previous loss', () => {
        const orders: OrderDTO[] = [
            { operation: OrderType.BUY, 'unit-cost': 10.0, 'quantity': 10000 },
            { operation: OrderType.BUY, 'unit-cost': 25.0, 'quantity': 5000 },
            { operation: OrderType.SELL, 'unit-cost': 15.0, 'quantity': 10000 },
            { operation: OrderType.SELL, 'unit-cost': 25.0, 'quantity': 5000 },
        ];

        const results = useCase.execute(orders);

        expect(results).toHaveLength(orders.length);

        results.forEach((result) => {
            expect(result).toHaveProperty('tax');
        });

        expect(results[0].tax).toBe(0);
        expect(results[1].tax).toBe(0);
        expect(results[2].tax).toBe(0);
        expect(results[3].tax).toBe(10000);
    });

    it('Case #6 - Should correctly calculate the tax on orders when there is a sequence of profits smaller than the loss, and finally a profit without loss', () => {
        const orders: OrderDTO[] = [
            { operation: OrderType.BUY, 'unit-cost': 10.0, 'quantity': 10000 },
            { operation: OrderType.SELL, 'unit-cost': 2.0, 'quantity': 5000 },
            { operation: OrderType.SELL, 'unit-cost': 20.0, 'quantity': 2000 },
            { operation: OrderType.SELL, 'unit-cost': 20.0, 'quantity': 2000 },
            { operation: OrderType.SELL, 'unit-cost': 25.0, 'quantity': 1000 },
        ];

        const results = useCase.execute(orders);

        expect(results).toHaveLength(orders.length);

        results.forEach((result) => {
            expect(result).toHaveProperty('tax');
        });

        expect(results[0].tax).toBe(0);
        expect(results[1].tax).toBe(0);
        expect(results[2].tax).toBe(0);
        expect(results[3].tax).toBe(0);
        expect(results[4].tax).toBe(3000);
    });

    it(`Case #7 - Should correctly calculate the tax on Case #6 + when there is a profit greater than the loss, with orders greater than ${SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX}, and a profit with orders less than ${SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX}`, () => {
        const orders: OrderDTO[] = [
            { operation: OrderType.BUY, 'unit-cost': 10.0, 'quantity': 10000 },
            { operation: OrderType.SELL, 'unit-cost': 2.0, 'quantity': 5000 },
            { operation: OrderType.SELL, 'unit-cost': 20.0, 'quantity': 2000 },
            { operation: OrderType.SELL, 'unit-cost': 20.0, 'quantity': 2000 },
            { operation: OrderType.SELL, 'unit-cost': 25.0, 'quantity': 1000 },
            { operation: OrderType.BUY, 'unit-cost': 20.0, 'quantity': 10000 },
            { operation: OrderType.SELL, 'unit-cost': 15.0, 'quantity': 5000 },
            { operation: OrderType.SELL, 'unit-cost': 30.0, 'quantity': 4350 },
            { operation: OrderType.SELL, 'unit-cost': 30.0, 'quantity': 650 },
        ];

        const results = useCase.execute(orders);

        expect(results).toHaveLength(orders.length);

        results.forEach((result) => {
            expect(result).toHaveProperty('tax');
        });

        expect(results[0].tax).toBe(0);
        expect(results[1].tax).toBe(0);
        expect(results[2].tax).toBe(0);
        expect(results[3].tax).toBe(0);
        expect(results[4].tax).toBe(3000);
        expect(results[5].tax).toBe(0);
        expect(results[6].tax).toBe(0);
        expect(results[7].tax).toBe(3700);
        expect(results[8].tax).toBe(0);
    });

    it('Case #8 - Should correctly calculate the tax on orders when there is a profit, even if the average price changes', () => {
        const orders: OrderDTO[] = [
            { operation: OrderType.BUY, 'unit-cost': 10.0, 'quantity': 10000 },
            { operation: OrderType.SELL, 'unit-cost': 50.0, 'quantity': 10000 },
            { operation: OrderType.BUY, 'unit-cost': 20.0, 'quantity': 10000 },
            { operation: OrderType.SELL, 'unit-cost': 50.0, 'quantity': 10000 },
        ];

        const results = useCase.execute(orders);

        expect(results).toHaveLength(orders.length);

        results.forEach((result) => {
            expect(result).toHaveProperty('tax');
        });

        expect(results[0].tax).toBe(0);
        expect(results[1].tax).toBe(80000);
        expect(results[2].tax).toBe(0);
        expect(results[3].tax).toBe(60000);
    });

    it(`Case #9 - Should calculate the tax correctly on orders when there is a profit greater than the loss, but the order is less than ${SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX}, applying the loss deduction only when there is a profit and the order is greater than ${SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX}`, () => {
        const orders: OrderDTO[] = [
            { operation: OrderType.BUY, 'unit-cost': 5000.0, 'quantity': 10 },
            { operation: OrderType.SELL, 'unit-cost': 4000.0, 'quantity': 5 },
            { operation: OrderType.BUY, 'unit-cost': 15000.0, 'quantity': 5 },
            { operation: OrderType.BUY, 'unit-cost': 4000.0, 'quantity': 2 },
            { operation: OrderType.BUY, 'unit-cost': 23000.0, 'quantity': 2 },
            { operation: OrderType.SELL, 'unit-cost': 20000.0, 'quantity': 1 },
            { operation: OrderType.SELL, 'unit-cost': 12000.0, 'quantity': 10 },
            { operation: OrderType.SELL, 'unit-cost': 15000.0, 'quantity': 3 },
        ];

        const results = useCase.execute(orders);

        expect(results).toHaveLength(orders.length);

        results.forEach((result) => {
            expect(result).toHaveProperty('tax');
        });

        expect(results[0].tax).toBe(0);
        expect(results[1].tax).toBe(0);
        expect(results[2].tax).toBe(0);
        expect(results[3].tax).toBe(0);
        expect(results[4].tax).toBe(0);
        expect(results[5].tax).toBe(0);
        expect(results[6].tax).toBe(1000);
        expect(results[7].tax).toBe(2400);
    });
});
