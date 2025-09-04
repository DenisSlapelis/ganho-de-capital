import { Portfolio } from '@entities';
import { QuantityVO, UnitCostVO } from '@value-objects';
import { logger, round } from '@utils';
import { SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX } from '@domain-constants';

jest.mock('@utils', () => ({
    logger: {
        debug: jest.fn(),
    },
    round: jest.fn((n) => n),
}));

describe('[UNIT TEST] Portfolio Entity', () => {
    let portfolio: Portfolio;

    beforeEach(() => {
        portfolio = new Portfolio();
        jest.clearAllMocks();
    });

    describe('[METHOD] buy', () => {
        it('Should update the average price and quantity correctly when making a purchase', () => {
            const calculateAveragePriceMock = jest.spyOn(portfolio as any, 'calculateAveragePrice').mockReturnValue(50);
            const updateAveragePriceMock = jest.spyOn(portfolio as any, 'updateAveragePrice').mockImplementation();
            const addQuantityMock = jest.spyOn(portfolio as any, 'addQuantity').mockImplementation();

            const quantity = new QuantityVO(10);
            const unitCost = new UnitCostVO(5);

            portfolio['buy'](quantity, unitCost);

            expect(calculateAveragePriceMock).toHaveBeenCalledWith(10, 5);
            expect(logger.debug).toHaveBeenCalledWith('Average price', 50);
            expect(updateAveragePriceMock).toHaveBeenCalledWith(50);
            expect(addQuantityMock).toHaveBeenCalledWith(10);
        });
    });

    describe('[METHOD] sell', () => {
        const quantity = new QuantityVO(100);
        const unitCost = new UnitCostVO(2);

        it('Should handle loss scenario', () => {
            const removeQuantityMock = jest.spyOn(portfolio as any, 'removeQuantity').mockImplementation();
            const updateAveragePriceMock = jest.spyOn(portfolio as any, 'updateAveragePrice').mockImplementation();
            const handleSellWithLossMock = jest
                .spyOn(portfolio as any, 'handleSellWithLoss')
                .mockReturnValue({ totalValue: 200, profit: 0 });

            portfolio['totalQuantity'] = 101;
            portfolio['averagePrice'] = 4;

            const result = portfolio['sell'](quantity, unitCost);

            expect(result).toEqual({ totalValue: 200, profit: 0 });
            expect(removeQuantityMock).toHaveBeenCalledTimes(1);
            expect(removeQuantityMock).toHaveBeenCalledWith(quantity.value);
            expect(updateAveragePriceMock).not.toHaveBeenCalled();
            expect(handleSellWithLossMock).toHaveBeenCalledWith(200, -200);
        });

        it('Should update average price when selling all quantities', () => {
            const updateAveragePriceMock = jest.spyOn(portfolio as any, 'updateAveragePrice').mockImplementation();

            portfolio['totalQuantity'] = 100;

            portfolio['sell'](quantity, unitCost);

            expect(updateAveragePriceMock).toHaveBeenCalledTimes(1);
        });

        it('Should handle zero profit scenario', () => {
            const removeQuantityMock = jest.spyOn(portfolio as any, 'removeQuantity').mockImplementation();
            const handleSellWithZeroProfitMock = jest
                .spyOn(portfolio as any, 'handleSellWithZeroProfit')
                .mockReturnValue({ totalValue: 200, profit: 0 });

            portfolio['totalQuantity'] = 101;
            portfolio['averagePrice'] = 2;

            const result = portfolio['sell'](quantity, unitCost);

            expect(result).toEqual({ totalValue: 200, profit: 0 });
            expect(removeQuantityMock).toHaveBeenCalledTimes(1);
            expect(removeQuantityMock).toHaveBeenCalledWith(quantity.value);
            expect(handleSellWithZeroProfitMock).toHaveBeenCalledWith(200);
        });

        it('Should handle profit with accumulated loss', () => {
            const removeQuantityMock = jest.spyOn(portfolio as any, 'removeQuantity').mockImplementation();
            const handleSellWithProfitAndAcumulatedLossMock = jest
                .spyOn(portfolio as any, 'handleSellWithProfitAndAcumulatedLoss')
                .mockReturnValue({ totalValue: 200, profit: 0 });

            portfolio['totalQuantity'] = 101;
            portfolio['averagePrice'] = 1;
            portfolio['totalLoss'] = 100;

            const result = portfolio['sell'](quantity, unitCost);

            expect(result).toEqual({ totalValue: 200, profit: 0 });
            expect(removeQuantityMock).toHaveBeenCalledTimes(1);
            expect(removeQuantityMock).toHaveBeenCalledWith(quantity.value);
            expect(handleSellWithProfitAndAcumulatedLossMock).toHaveBeenCalledWith(200, 100);
        });

        it('Should handle profit without accumulated loss', () => {
            const removeQuantityMock = jest.spyOn(portfolio as any, 'removeQuantity').mockImplementation();

            portfolio['totalQuantity'] = 101;
            portfolio['averagePrice'] = 1;
            portfolio['totalLoss'] = 0;

            const result = portfolio['sell'](quantity, unitCost);

            expect(result).toEqual({ totalValue: 200, profit: 100 });
            expect(removeQuantityMock).toHaveBeenCalledTimes(1);
            expect(removeQuantityMock).toHaveBeenCalledWith(quantity.value);
        });
    });

    describe('[METHOD] addQuantity', () => {
        it('Should add quantity', () => {
            portfolio['totalQuantity'] = 10;
            portfolio['addQuantity'](10);
            expect(portfolio['totalQuantity']).toBe(20);
        });

        it('Should throw if value is invalid', () => {
            expect(() => portfolio['addQuantity'](0)).toThrow(`Invalid value when adding 'totalQuantity': 0`);
            expect(() => portfolio['addQuantity'](NaN)).toThrow(`Invalid value when adding 'totalQuantity': NaN`);
            expect(() => portfolio['addQuantity'](-1)).toThrow(`The value to add in the 'totalQuantity' field cannot be negative: -1`);
        });

        it('Should throw if value is negative', () => {
            expect(() => portfolio['addQuantity'](-1)).toThrow(`The value to add in the 'totalQuantity' field cannot be negative: -1`);
        });
    });

    describe('[METHOD] removeQuantity', () => {
        it('Should remove quantity', () => {
            portfolio['totalQuantity'] = 10;
            portfolio['removeQuantity'](5);
            expect(portfolio['totalQuantity']).toBe(5);
        });

        it('Should throw if value is invalid', () => {
            expect(() => portfolio['removeQuantity'](0)).toThrow(`Invalid value when removing 'totalQuantity': 0`);
            expect(() => portfolio['removeQuantity'](NaN)).toThrow(`Invalid value when removing 'totalQuantity': NaN`);
        });

        it('Should throw if totalQuantity will be negative', () => {
            portfolio['totalQuantity'] = 10;

            expect(() => portfolio['removeQuantity'](20)).toThrow(`'totalQuantity' cannot be negative: 10 - 20`);
        });
    });

    describe('[METHOD] updateAveragePrice', () => {
        it('Should update average price', () => {
            portfolio['averagePrice'] = 1;
            portfolio['updateAveragePrice'](5);
            expect(portfolio['averagePrice']).toBe(5);
        });

        it('Should throw if value is invalid', () => {
            expect(() => portfolio['updateAveragePrice'](null as any)).toThrow(`Invalid value when updating 'averagePrice': null`);
            expect(() => portfolio['updateAveragePrice'](NaN)).toThrow(`Invalid value when updating 'averagePrice': NaN`);
            expect(() => portfolio['addQuantity'](-1)).toThrow(`The value to add in the 'totalQuantity' field cannot be negative: -1`);
        });

        it('Should throw if value is negative', () => {
            expect(() => portfolio['updateAveragePrice'](-1)).toThrow(`The 'averagePrice' cannot be negative: -1`);
        });
    });

    describe('[METHOD] addLoss', () => {
        it('Should add loss correctly', () => {
            portfolio['totalLoss'] = 50;
            portfolio['addLoss'](50);

            expect(logger.debug).toHaveBeenCalledTimes(2);
            expect(portfolio['totalLoss']).toBe(100);
        });

        it('Should throw if value is invalid', () => {
            expect(() => portfolio['addLoss'](0)).toThrow(`Invalid value when adding 'totalLoss': 0`);
            expect(() => portfolio['addLoss'](null as any)).toThrow(`Invalid value when adding 'totalLoss': null`);
            expect(() => portfolio['addLoss'](NaN)).toThrow(`Invalid value when adding 'totalLoss': NaN`);
        });
    });

    describe('[METHOD] discountLoss', () => {
        it('Should discount loss correctly', () => {
            portfolio['totalLoss'] = 1000;
            portfolio['discountLoss'](1000);

            expect(logger.debug).toHaveBeenCalledTimes(2);
            expect(portfolio['totalLoss']).toBe(0);
        });

        it('Should throw if value is invalid', () => {
            expect(() => portfolio['discountLoss'](0)).toThrow(`Invalid value when discounting 'totalLoss': 0`);
            expect(() => portfolio['discountLoss'](null as any)).toThrow(`Invalid value when discounting 'totalLoss': null`);
            expect(() => portfolio['discountLoss'](NaN)).toThrow(`Invalid value when discounting 'totalLoss': NaN`);
        });

        it('Should throw if value is greater than total loss', () => {
            portfolio['totalLoss'] = 50;
            const discountValue = 51;

            expect(() => portfolio['discountLoss'](discountValue)).toThrow(
                `The discount amount (${discountValue}) cannot exceed the accumulated loss (${portfolio['totalLoss']})`
            );
        });
    });

    describe('[METHOD] handleSellWithLoss', () => {
        it('Should call addLoss and return profit 0', () => {
            const addLossMock = jest.spyOn(portfolio as any, 'addLoss').mockImplementation();
            const result = portfolio['handleSellWithLoss'](100, -20);

            expect(logger.debug).toHaveBeenCalledWith('Loss on sale');
            expect(addLossMock).toHaveBeenCalledWith(-20);
            expect(result).toEqual({ totalValue: 100, profit: 0 });
        });
    });

    describe('[METHOD] handleSellWithZeroProfit', () => {
        it('Should return profit 0', () => {
            const result = portfolio['handleSellWithZeroProfit'](100);

            expect(logger.debug).toHaveBeenCalledWith('No profit on sale');
            expect(result).toEqual({ totalValue: 100, profit: 0 });
        });
    });

    describe('[METHOD] handleSellWithProfitAndAcumulatedLoss', () => {
        it(`Should not discount loss if transaction value is less than ${SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX}`, () => {
            jest.spyOn(portfolio as any, 'discountLoss').mockImplementation();

            portfolio['totalLoss'] = 50;

            const totalValue = 200;

            const result = portfolio['handleSellWithProfitAndAcumulatedLoss'](totalValue, 100);

            expect(result).toEqual({ totalValue, profit: 100 });
            expect(logger.debug).toHaveBeenCalledWith('Sell with profit and acumulated loss');
            expect(logger.debug).toHaveBeenCalledWith(
                `The loss was not discounted because the total sale amount (${totalValue}) is less than the amount required to apply the discount (${SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX}).`
            );
            expect(round).not.toHaveBeenCalled();
            expect(portfolio['discountLoss']).not.toHaveBeenCalled();
        });

        it('Should return zero profit if loss covers all profit', () => {
            jest.spyOn(portfolio as any, 'discountLoss').mockImplementation();

            portfolio['totalLoss'] = 100;

            (round as jest.Mock).mockReturnValueOnce(100).mockReturnValueOnce(0);

            const result = portfolio['handleSellWithProfitAndAcumulatedLoss'](50000, 100);

            expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('No profit after discounting loss'));
            expect(result).toEqual({ totalValue: 50000, profit: 0 });
        });

        it(`Should discount loss and return correct profit if transaction value is greater than ${SELL_MAXIMUM_TRANSACTION_VALUE_WITHOUT_TAX}`, () => {
            jest.spyOn(portfolio as any, 'discountLoss').mockImplementation();

            portfolio['totalLoss'] = 50;

            const result = portfolio['handleSellWithProfitAndAcumulatedLoss'](50000, 100);

            expect(result).toEqual({ totalValue: 50000, profit: 50 });
            expect(round).toHaveBeenCalled();
            expect(logger.debug).toHaveBeenCalledWith('Sell with profit and acumulated loss');
            expect(portfolio['discountLoss']).toHaveBeenCalledWith(50);
        });
    });
});
