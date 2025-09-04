import { SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX } from '@domain-constants';
import { SellDTO } from '@dtos';
import { logger, round } from '@utils';
import { QuantityVO, UnitCostVO } from '@value-objects';

export class Portfolio {
    private totalQuantity: number;
    private averagePrice: number;
    private totalLoss: number;

    constructor() {
        this.totalQuantity = 0;
        this.averagePrice = 0;
        this.totalLoss = 0;
    }

    buy = (_quantity: QuantityVO, _unitCost: UnitCostVO): void => {
        const quantity = _quantity.value;
        const unitCost = _unitCost.value;

        const newAveragePrice = this.calculateAveragePrice(quantity, unitCost);

        logger.debug('Average price', newAveragePrice);

        this.updateAveragePrice(newAveragePrice);
        this.addQuantity(quantity);
    };

    sell = (_quantity: QuantityVO, _unitCost: UnitCostVO): SellDTO => {
        const quantity = _quantity.value;
        const unitCost = _unitCost.value;

        this.removeQuantity(quantity);

        const totalValue = quantity * unitCost;
        const totalCost = quantity * this.averagePrice;
        const profit = totalValue - totalCost;

        if (this.totalQuantity === 0) this.updateAveragePrice(0);

        if (profit < 0) return this.handleSellWithLoss(totalValue, profit);

        if (profit === 0) return this.handleSellWithZeroProfit(totalValue);

        const hasProfitAndLoss = this.totalLoss > 0;

        if (hasProfitAndLoss) return this.handleSellWithProfitAndAcumulatedLoss(totalValue, profit);

        return { totalValue, profit };
    };

    private addQuantity = (value: number): void => {
        const invalidValue = !value || isNaN(value);
        if (invalidValue) throw new Error(`Invalid value when adding 'totalQuantity': ${value}`);
        if (value < 0) throw new Error(`The value to add in the 'totalQuantity' field cannot be negative: ${value}`);

        this.totalQuantity += value;
    };

    private removeQuantity = (value: number): void => {
        const invalidValue = !value || isNaN(value);
        if (invalidValue) throw new Error(`Invalid value when removing 'totalQuantity': ${value}`);

        const willBeNegative = this.totalQuantity - value < 0;

        if (willBeNegative) throw new Error(`'totalQuantity' cannot be negative: ${this.totalQuantity} - ${value}`);

        this.totalQuantity -= value;
    };

    private updateAveragePrice = (newValue: number): void => {
        const invalidValue = (newValue !== 0 && !newValue) || isNaN(newValue);
        if (invalidValue) throw new Error(`Invalid value when updating 'averagePrice': ${newValue}`);
        if (newValue < 0) throw new Error(`The 'averagePrice' cannot be negative: ${newValue}`);

        this.averagePrice = newValue;
    };

    private addLoss = (value: number): void => {
        const invalidValue = !value || isNaN(value);
        if (invalidValue) throw new Error(`Invalid value when adding 'totalLoss': ${value}`);

        logger.debug(`Adding loss: ${value}`);

        this.totalLoss += Math.abs(value);

        logger.debug(`New 'totalLoss' ${this.totalLoss}`);
    };

    private discountLoss = (discountValue: number): void => {
        const invalidValue = !discountValue || isNaN(discountValue);
        if (invalidValue) throw new Error(`Invalid value when discounting 'totalLoss': ${discountValue}`);
        if (discountValue > this.totalLoss) {
            throw new Error(`The discount amount (${discountValue}) cannot exceed the accumulated loss (${this.totalLoss})`);
        }

        logger.debug(`Discounting loss - ${discountValue}`);

        this.totalLoss -= discountValue;

        logger.debug(`New 'totalLoss' after discounting ${this.totalLoss}`);
    };

    private calculateAveragePrice = (quantity: number, unitCost: number) => {
        const currentPosition = this.totalQuantity * this.averagePrice;
        const orderTotalCost = quantity * unitCost;
        const newTotalQuantity = this.totalQuantity + quantity;

        return (currentPosition + orderTotalCost) / newTotalQuantity;
    };

    private handleSellWithLoss = (totalValue: number, profit: number): SellDTO => {
        logger.debug('Loss on sale');

        this.addLoss(profit);

        return { totalValue, profit: 0 };
    };

    private handleSellWithZeroProfit = (totalValue: number): SellDTO => {
        logger.debug('No profit on sale');

        return { totalValue, profit: 0 };
    };

    private handleSellWithProfitAndAcumulatedLoss = (totalValue: number, profit: number): SellDTO => {
        logger.debug('Sell with profit and acumulated loss');

        if (totalValue <= SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX) {
            logger.debug(
                `The loss was not discounted because the total sale amount (${totalValue}) is less than the amount required to apply the discount (${SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX}).`
            );

            return { totalValue, profit };
        }

        const amountToCoverLoss = round(Math.min(profit, this.totalLoss));

        this.discountLoss(amountToCoverLoss);

        const profitAfterDiscountingLoss = round(profit - amountToCoverLoss);

        if (profitAfterDiscountingLoss === 0) {
            logger.debug(`No profit after discounting loss. New total loss: ${this.totalLoss}`);

            return { totalValue, profit: 0 };
        }

        return { totalValue, profit: profitAfterDiscountingLoss };
    };
}
