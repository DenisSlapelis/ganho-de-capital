import { OrderType } from '@dtos';

export interface TaxCalculator {
    mustPayTax(value: number): boolean;
    calculateTax(value: number): number;

    readonly orderType: OrderType;
}
