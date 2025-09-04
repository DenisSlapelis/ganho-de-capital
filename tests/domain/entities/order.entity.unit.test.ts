import { Order } from '@entities';
import { OrderType, OrderDTO } from '@dtos';
import { QuantityVO, UnitCostVO } from '@value-objects';

jest.mock('@value-objects', () => ({
    QuantityVO: jest.fn(),
    UnitCostVO: jest.fn(),
}));

describe('[UNIT TEST] Order Entity', () => {
    describe('[CONSTRUCTOR]', () => {
        it('Should create a order correctly when all params are valid', () => {
            const params: OrderDTO = {
                operation: OrderType.BUY,
                'unit-cost': 10.5,
                quantity: 100,
            };

            const result = new Order(params);

            expect(result).toBeInstanceOf(Order);
            expect(UnitCostVO).toHaveBeenCalledWith(10.5);
            expect(QuantityVO).toHaveBeenCalledWith(100);
        });

        it('Should throw an error when the type parameter is invalid', () => {
            const params = {
                operation: 'INVALID' as OrderType,
                'unit-cost': 10,
                quantity: 5,
            };

            expect(() => new Order(params)).toThrow(`Invalid type type: 'INVALID'`);
        });
    });
});
