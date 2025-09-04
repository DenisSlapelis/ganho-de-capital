export enum OrderType {
    SELL = 'sell',
    BUY = 'buy',
}

export type OrderDTO = {
    operation: OrderType;
    'unit-cost': number;
    quantity: number;
};

export interface OrderOutputDTO {
    tax: number
}