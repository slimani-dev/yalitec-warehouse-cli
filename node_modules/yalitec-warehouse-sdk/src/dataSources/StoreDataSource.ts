import DataSource from "./DataSource";
import {Store, StoreCreateInput, StoreUpdateInput} from '../types'

export default class StoreDataSource extends DataSource {

    async list(seller_id?: string, page?: number) {


        let endpoint = this.endpoints.stores.index;
        let urlSearchParams = new URLSearchParams();

        if (seller_id) {
            urlSearchParams.append('seller_id', seller_id)
        }

        if (page) {
            urlSearchParams.append('page', page.toString())
        }

        if (urlSearchParams.size) {
            endpoint += '?' + urlSearchParams;
        }

        return await this.fetch<Store[]>(endpoint);
    }

    async find(id: number) {
        return await this.fetch<Store>(this.endpoints.stores.show(id));
    }

    async create(input: StoreCreateInput) {
        return await this.fetch<Store>(this.endpoints.stores.create, {
            method: 'POST',
            body: JSON.stringify(input)
        });
    }

    async update(id: number, input: StoreUpdateInput) {
        return await this.fetch<Store>(this.endpoints.stores.update(id), {
            method: 'PUT',
            body: JSON.stringify(input)
        });
    }
}
