import { round } from '@utils';

export class UnitCostVO {
    readonly value: number;

    constructor(value: number) {
        const invalidNumber = isNaN(value) || value === null;

        if (invalidNumber) throw new Error(`Unit cost must be a valid number. Received: ${value}`);

        if (value <= 0) throw new Error(`Unit cost must be greater than zero. Received: ${value}`);

        this.value = round(value);
    }
}
