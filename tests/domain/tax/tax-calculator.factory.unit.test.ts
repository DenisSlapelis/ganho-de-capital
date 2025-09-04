import { OrderType } from '@dtos';
import { TaxCalculatorFactory, SellTaxCalculator, TaxCalculator, BuyTaxCalculator } from '@tax';

describe('[UNIT TEST] TaxCalculatorFactory', () => {
    const factory = new TaxCalculatorFactory();

    describe('[METHOD] getCalculator', () => {
        it('Should return BuyTaxCalculator when type type is BUY', () => {
            const result = factory.getCalculator(OrderType.BUY);

            expect(result).toBeInstanceOf(BuyTaxCalculator);
            expect(result).toHaveProperty('orderType', OrderType.BUY);
            expect(result).toMatchObject<TaxCalculator>({
                orderType: OrderType.BUY,
                mustPayTax: expect.any(Function),
                calculateTax: expect.any(Function),
            });
        });

        it('Should return BuyTaxCalculator when type type is SELL', () => {
            const result = factory.getCalculator(OrderType.SELL);

            expect(result).toBeInstanceOf(SellTaxCalculator);
            expect(result).toHaveProperty('orderType', OrderType.SELL);
            expect(result).toMatchObject<TaxCalculator>({
                orderType: OrderType.SELL,
                mustPayTax: expect.any(Function),
                calculateTax: expect.any(Function),
            });
        });

        it('Should throw an error when no calculator exists for the given type type', () => {
            const invalidOrderType = 'EXAMPLE' as OrderType;

            expect(() => factory.getCalculator(invalidOrderType)).toThrow(
                `No tax calculator found for type type: '${invalidOrderType}'`
            );
        });
    });
});
