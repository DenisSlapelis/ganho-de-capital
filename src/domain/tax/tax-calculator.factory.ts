import { OrderType } from '@dtos';
import { BuyTaxCalculator } from './buy-tax-calculator';
import { SellTaxCalculator } from './sell-tax-calculator';
import { TaxCalculator } from './tax-calculator.interface';

export class TaxCalculatorFactory {
    private calculators: TaxCalculator[];

    constructor() {
        this.calculators = [new BuyTaxCalculator(), new SellTaxCalculator()];
    }

    getCalculator = (orderType: OrderType): TaxCalculator => {
        const calculator = this.calculators.find((calculator) => calculator.orderType === orderType);

        if (!calculator) throw new Error(`No tax calculator found for type type: '${orderType}'`);

        return calculator;
    };
}
