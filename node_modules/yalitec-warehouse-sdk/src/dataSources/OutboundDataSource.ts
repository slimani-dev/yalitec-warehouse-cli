import DataSource from "./DataSource";
import {Outbound, OutboundsFilter, OutboundCreateInput, OutboundUpdateInput} from "../types";

export default class OutboundDataSource extends DataSource {
    async list(options: OutboundsFilter) {
        // distrust the options

        const {
            page,
            sellerId,
            sellerIds,
            storeId,
            storeIds,
            status,
            sku,
            skus
        } = options;


        let endpoint = this.endpoints.outbounds.index;
        let urlSearchParams = new URLSearchParams();

        if (storeId) {
            urlSearchParams.append('store_id', storeId.toString())
        }

        if (storeIds) {
            storeIds.forEach(storeId => urlSearchParams.append('store_ids[]', storeId.toString()))
        }

        if (sellerId) {
            urlSearchParams.append('seller_id', sellerId)
        }

        if (sellerIds) {
            sellerIds.forEach(sellerId => urlSearchParams.append('seller_ids[]', sellerId))
        }

        if (status) {
            urlSearchParams.append('status', status)
        }


        if (sku) {
            urlSearchParams.append('sku', sku)
        }


        if (skus) {
            skus.forEach(sku => urlSearchParams.append('skus[]', sku))
        }

        if (page) {
            urlSearchParams.append('page', page.toString())
        }

        if (urlSearchParams.size) {
            endpoint += '?' + urlSearchParams;
        }

        return await this.fetch<Outbound[]>(endpoint);
    }

    async find(number: string) {
        return await this.fetch<Outbound>(this.endpoints.outbounds.show(number));
    }

    async create(input: OutboundCreateInput) {
        return await this.fetch<Outbound>(this.endpoints.outbounds.create, {
            method: 'POST',
            body: JSON.stringify(input)
        });
    }

    async update(number: string, input: OutboundUpdateInput) {
        return await this.fetch<Outbound>(this.endpoints.outbounds.update(number), {
            method: 'PUT',
            body: JSON.stringify(input)
        });
    }

    async delete(number: string) {
        return await this.fetch<Outbound>(this.endpoints.outbounds.delete(number), {
            method: 'DELETE',
        });
    }
}
