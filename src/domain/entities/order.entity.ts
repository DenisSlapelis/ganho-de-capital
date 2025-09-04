import { OrderType, OrderDTO } from "@dtos";
import { QuantityVO, UnitCostVO } from "@value-objects";


export class Order {
    readonly type: OrderType;
    readonly unitCost: UnitCostVO;
    readonly quantity: QuantityVO;

    constructor(params: OrderDTO) {
        if (!Object.values(OrderType).includes(params.operation)) {
            throw new Error(`Invalid type type: '${params.operation}'`);
        }

        this.type = params.operation;
        this.unitCost = new UnitCostVO(params['unit-cost']);
        this.quantity = new QuantityVO(params.quantity);
    }
}
