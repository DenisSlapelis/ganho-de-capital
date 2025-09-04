export class QuantityVO {
    readonly value: number;

    constructor(value: number) {
        const invalidNumber = isNaN(value) || value === null;

        if (invalidNumber) throw new Error(`Quantity must be a valid number. Received: ${value}`);

        if (value <= 0) throw new Error(`Quantity must be greater than zero. Received: ${value}`);

        if (!Number.isInteger(value)) throw new Error(`Quantity must be an integer. Received: ${value}`);

        this.value = value;
    }
}
