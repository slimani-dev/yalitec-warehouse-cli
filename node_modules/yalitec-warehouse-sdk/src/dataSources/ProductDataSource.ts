import DataSource from "./DataSource";
import {Product, ProductCreateInput, ProductsFilter, ProductUpdateInput} from "../types";

export default class ProductDataSource extends DataSource {
    async list(options: ProductsFilter) {
        // distrust the options

        const {
            page,
            sellerId,
            sellerIds,
            sku,
            skus,
            storeId,
            storeIds
        } = options;


        let endpoint = this.endpoints.products.index;
        let urlSearchParams = new URLSearchParams();


        if (sku) {
            urlSearchParams.append('sku', sku)
        }

        if (skus) {
            skus.forEach(sku => urlSearchParams.append('skus[]', sku))
        }

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

        if (page) {
            urlSearchParams.append('page', page.toString())
        }

        if (urlSearchParams.size) {
            endpoint += '?' + urlSearchParams;
        }

        return await this.fetch<Product[]>(endpoint);
    }

    async find(sku: string) {
        return await this.fetch<Product>(this.endpoints.products.show(sku));
    }

    async create(input: ProductCreateInput) {
        return await this.fetch<Product>(this.endpoints.products.create, {
            method: 'POST',
            body: JSON.stringify(input)
        });
    }

    async update(sku: string, input: ProductUpdateInput) {
        return await this.fetch<Product>(this.endpoints.products.update(sku), {
            method: 'PUT',
            body: JSON.stringify(input)
        });
    }
}
