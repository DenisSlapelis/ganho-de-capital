import { OrderOutputDTO } from "@dtos";
import { Portfolio, Order } from "@entities";
import { TaxCalculator } from "@tax";

export interface OrderStrategy {
    execute(order: Order, portfolio: Portfolio, tax: TaxCalculator): OrderOutputDTO;
}
