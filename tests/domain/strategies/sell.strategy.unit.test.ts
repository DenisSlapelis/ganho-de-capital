import { OrderOutputDTO } from '@dtos';
import { Order, Portfolio } from '@entities';
import { SellStrategy } from '@strategies';
import { TaxCalculator } from '@tax';
import { logger } from '@utils';

jest.mock('@utils', () => ({
    logger: {
        debug: jest.fn(),
    },
}));

describe('[UNIT TEST] SellStrategy', () => {
    let mockOrder: Order;
    let mockPortfolio: jest.Mocked<Portfolio>;
    let mockTaxCalculator: jest.Mocked<TaxCalculator>;
    let strategy: SellStrategy;

    beforeEach(() => {
        jest.resetModules();
        strategy = new SellStrategy();
        mockOrder = {
            quantity: 1000,
            unitCost: 2,
        } as unknown as Order;

        mockPortfolio = {
            sell: jest.fn().mockReturnValue({
                totalValue: 2000,
                profit: 1000,
            }),
        } as unknown as jest.Mocked<Portfolio>;

        mockTaxCalculator = {
            mustPayTax: jest.fn(),
            calculateTax: jest.fn(),
        } as unknown as jest.Mocked<TaxCalculator>;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('[METHOD] execute', () => {
        it('Should calculate the tax correctly when there is tax to be paid', () => {
            mockTaxCalculator.mustPayTax.mockReturnValue(true);
            mockTaxCalculator.calculateTax.mockReturnValue(200);

            const result = strategy.execute(mockOrder, mockPortfolio, mockTaxCalculator);

            expect(result).toHaveProperty('tax');
            expect(result).toMatchObject<OrderOutputDTO>({ tax: 200 });
            expect(logger.debug).toHaveBeenCalled();
            expect(mockPortfolio.sell).toHaveBeenCalledTimes(1);
            expect(mockPortfolio.sell).toHaveBeenCalledWith(mockOrder.quantity, mockOrder.unitCost);
            expect(mockTaxCalculator.mustPayTax).toHaveBeenCalledTimes(1);
            expect(mockTaxCalculator.mustPayTax).toHaveBeenCalledWith(2000);
            expect(mockTaxCalculator.calculateTax).toHaveBeenCalledTimes(1);
            expect(mockTaxCalculator.calculateTax).toHaveBeenCalledWith(1000);
        });

        it('Should return zero when there is no tax to be paid', () => {
            mockTaxCalculator.mustPayTax.mockReturnValue(false);

            const result = strategy.execute(mockOrder, mockPortfolio, mockTaxCalculator);

            expect(result).toHaveProperty('tax');
            expect(result).toMatchObject<OrderOutputDTO>({ tax: 0 });
            expect(logger.debug).toHaveBeenCalled();
            expect(mockPortfolio.sell).toHaveBeenCalledTimes(1);
            expect(mockPortfolio.sell).toHaveBeenCalledWith(mockOrder.quantity, mockOrder.unitCost);
            expect(mockTaxCalculator.mustPayTax).toHaveBeenCalledTimes(1);
            expect(mockTaxCalculator.mustPayTax).toHaveBeenCalledWith(2000);
            expect(mockTaxCalculator.calculateTax).not.toHaveBeenCalled();
        });
    });
});
