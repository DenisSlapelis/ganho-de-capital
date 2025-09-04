import { OrderOutputDTO } from '@dtos';
import { Order, Portfolio } from '@entities';
import { BuyStrategy } from '@strategies';
import { TaxCalculator } from '@tax';

describe('[UNIT TEST] BuyStrategy', () => {
    let mockOrder: Order;
    let mockPortfolio: jest.Mocked<Portfolio>;
    let mockTaxCalculator: jest.Mocked<TaxCalculator>;
    let strategy: BuyStrategy;

    beforeEach(() => {
        strategy = new BuyStrategy();
        mockOrder = {
            quantity: 100,
            unitCost: 2,
        } as unknown as Order;

        mockPortfolio = {
            buy: jest.fn(),
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
            mockTaxCalculator.calculateTax.mockReturnValue(0);

            const result = strategy.execute(mockOrder, mockPortfolio, mockTaxCalculator);

            expect(result).toHaveProperty('tax');
            expect(result).toMatchObject<OrderOutputDTO>({ tax: 0 });
            expect(mockPortfolio.buy).toHaveBeenCalledTimes(1);
            expect(mockPortfolio.buy).toHaveBeenCalledWith(mockOrder.quantity, mockOrder.unitCost);
            expect(mockTaxCalculator.mustPayTax).toHaveBeenCalledTimes(1);
            expect(mockTaxCalculator.mustPayTax).toHaveBeenCalledWith(0);
            expect(mockTaxCalculator.calculateTax).toHaveBeenCalledTimes(1);
            expect(mockTaxCalculator.calculateTax).toHaveBeenCalledWith(0);
        });

        it('Should return zero when there is no tax to be paid', () => {
            mockTaxCalculator.mustPayTax.mockReturnValue(false);

            const result = strategy.execute(mockOrder, mockPortfolio, mockTaxCalculator);

            expect(result).toHaveProperty('tax');
            expect(result).toMatchObject<OrderOutputDTO>({ tax: 0 });
            expect(mockPortfolio.buy).toHaveBeenCalledTimes(1);
            expect(mockPortfolio.buy).toHaveBeenCalledWith(mockOrder.quantity, mockOrder.unitCost);
            expect(mockTaxCalculator.mustPayTax).toHaveBeenCalledTimes(1);
            expect(mockTaxCalculator.mustPayTax).toHaveBeenCalledWith(0);
            expect(mockTaxCalculator.calculateTax).not.toHaveBeenCalled();
        });
    });
});
