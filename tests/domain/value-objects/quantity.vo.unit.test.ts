import { QuantityVO } from '@value-objects';

describe('[UNIT TEST] QuantityVO', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('[CONSTRUCTOR]', () => {
        it('Should correctly instantiate the class when all parameters are valid', () => {
            const isNaNSpy = jest.spyOn(global, 'isNaN');
            const isIntegerSpy = jest.spyOn(Number, 'isInteger');

            const result = new QuantityVO(10);

            expect(result.value).toBe(10);
            expect(isNaNSpy).toHaveBeenCalledWith(10);
            expect(isIntegerSpy).toHaveBeenCalledWith(10);
        });

        it('Should throw an error if the value is not a valid number', () => {
            expect(() => new QuantityVO(NaN)).toThrow('Quantity must be a valid number. Received: NaN');
            expect(() => new QuantityVO(null as any)).toThrow('Quantity must be a valid number. Received: null');
            expect(() => new QuantityVO(undefined as any)).toThrow('Quantity must be a valid number. Received: undefined');
        });

        it('Should throw an error if the value is less than zero', () => {
            expect(() => new QuantityVO(0)).toThrow('Quantity must be greater than zero. Received: 0');
            expect(() => new QuantityVO(-10)).toThrow('Quantity must be greater than zero. Received: -10');
        });

        it('Should throw an error if the value is not an Integer', () => {
            expect(() => new QuantityVO(10.5)).toThrow('Quantity must be an integer. Received: 10.5');
        });
    });
});
