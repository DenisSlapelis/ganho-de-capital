import { OrderType } from '@dtos';
import { TaxCalculator } from './tax-calculator.interface';

export class BuyTaxCalculator implements TaxCalculator {
    readonly orderType = OrderType.BUY;

    mustPayTax = (value: number): boolean => {
        return false;
    };

    calculateTax = (value: number): number => {
        return 0;
    };
}
