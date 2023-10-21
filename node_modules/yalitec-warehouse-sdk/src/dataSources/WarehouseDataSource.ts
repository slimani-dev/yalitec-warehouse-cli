import DataSource from "./DataSource";
import {Warehouse} from '../types'

export default class WarehouseDataSource extends DataSource {

    async list() {
        return await this.fetch<Warehouse[]>(this.endpoints.warehouses.index);
    }
}
