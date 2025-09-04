import { OrderType } from '@dtos';
import { TaxCalculator } from './tax-calculator.interface';
import { round } from '@utils';
import { SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX, SELL_TAX_RATE } from '@domain-constants';

export class SellTaxCalculator implements TaxCalculator {
    readonly orderType = OrderType.SELL;

    mustPayTax = (value: number): boolean => {
        return value > SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX;
    };

    calculateTax = (value: number): number => {
        return round(value * SELL_TAX_RATE);
    };
}
