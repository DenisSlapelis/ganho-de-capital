import { Portfolio, Order } from "@entities";
import { OrderStrategy } from "./order-strategy.interface";
import { TaxCalculator } from "@tax";
import { OrderOutputDTO } from "@dtos";
import { logger } from "@utils";


export class SellStrategy implements OrderStrategy {
    execute = (order: Order, portfolio: Portfolio, taxCalculator: TaxCalculator): OrderOutputDTO => {
        const { quantity, unitCost } = order;

        const { totalValue, profit } = portfolio.sell(quantity, unitCost);

        const result = taxCalculator.mustPayTax(totalValue) ? taxCalculator.calculateTax(profit) : 0;

        logger.debug(`Tax on profit (${profit}) for totalValue (${totalValue}): ${result}`);

        return { tax: result };
    };
}
