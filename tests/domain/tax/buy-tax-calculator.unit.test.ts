import { OrderType } from '@dtos';
import { BuyTaxCalculator } from '@tax';

describe('[UNIT TEST] BuyTaxCalculator', () => {
    const calculator = new BuyTaxCalculator();

    describe('[CONSTRUCTOR]', () => {
        it('Should return the correctly type type', () => {
            const result = calculator.orderType;

            expect(result).toBe(OrderType.BUY);
        });
    });

    describe('[METHOD] mustPayTax', () => {
        it('Should return false regardless of the value passed', () => {
            const result = calculator.mustPayTax(10);

            expect(result).toBe(false);
        });
    });

    describe('[METHOD] calculateTax', () => {
        it('Should return 0 regardless of the value passed', () => {
            const result = calculator.calculateTax(10);

            expect(result).toBe(0);
        });
    });
});
