import { UnitCostVO } from '@value-objects';
import { round } from '@utils';

jest.mock('@utils', () => ({
    round: jest.fn(),
}));

describe('[UNIT TEST] UnitCostVO', () => {
    describe('[CONSTRUCTOR]', () => {
        it('Should correctly instantiate the class when all parameters are valid', () => {
            (round as jest.Mock).mockReturnValue(10.12);

            const result = new UnitCostVO(10.123);

            expect(result.value).toBe(10.12);
            expect(round).toHaveBeenCalledWith(10.123);
        });

        it('Should throw an error if the value is less than zero', () => {
            expect(() => new UnitCostVO(0)).toThrow('Unit cost must be greater than zero. Received: 0');
            expect(() => new UnitCostVO(-5)).toThrow('Unit cost must be greater than zero. Received: -5');
        });

        it('Should throw an error if the value is not a valid number', () => {
            expect(() => new UnitCostVO(NaN)).toThrow('Unit cost must be a valid number. Received: NaN');
            expect(() => new UnitCostVO(null as any)).toThrow('Unit cost must be a valid number. Received: null');
            expect(() => new UnitCostVO(undefined as any)).toThrow('Unit cost must be a valid number. Received: undefined');
        });
    });
});
