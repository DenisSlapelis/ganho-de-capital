import { Portfolio, Order } from "@entities";
import { OrderStrategy } from "./order-strategy.interface";
import { TaxCalculator } from "@tax";
import { OrderOutputDTO } from "@dtos";

export class BuyStrategy implements OrderStrategy {
    execute = (order: Order, portfolio: Portfolio, taxCalculator: TaxCalculator): OrderOutputDTO => {
        const { quantity, unitCost } = order;

        portfolio.buy(quantity, unitCost);

        const result = taxCalculator.mustPayTax(0) ? taxCalculator.calculateTax(0) : 0;

        return { tax: result };
    };
}
