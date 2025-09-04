import { OrderType } from '@dtos';
import { SellTaxCalculator } from '@tax';
import { SELL_TAX_RATE } from '@domain-constants';

describe('[UNIT TEST] SellTaxCalculator', () => {
    const calculator = new SellTaxCalculator();

    describe('[CONSTRUCTOR]', () => {
        it('Should return the correctly type type', () => {
            const result = calculator.orderType;

            expect(result).toBe(OrderType.SELL);
        });
    });

    describe('[METHOD] mustPayTax', () => {
        it('Should return correctly if you must to pay the tax when the value is greater than the configured value', () => {
            const result = calculator.mustPayTax(20001);

            expect(result).toBe(true);
        });
        it('Should return correctly if you must to pay the tax when the value is less than the configured value', () => {
            const result = calculator.mustPayTax(19999);

            expect(result).toBe(false);
        });
    });
    it('Should return correctly if you must to pay the tax when the value is equal to than the configured value', () => {
        const result = calculator.mustPayTax(20000);

        expect(result).toBe(false);
    });

    describe('[METHOD] calculateTax', () => {
        it(`Should calculate the rate of ${SELL_TAX_RATE}% correctly`, () => {
            const result = calculator.calculateTax(100);

            expect(result).toBe(20);
        });
    });
});
