export interface Outbound {
    store_id: number
    number: string
    type: string
    status: string
    note?: string
    invoice_n: string
    name: string
    address: string
    address2?: string
    zip?: string
    phone: string
    freeshipping: boolean
    is_stopdesk: boolean
    has_exchange: boolean
    product_to_collect: any
    city_id: number
    state_id: number
    warehouse_id: number
    outboundProducts: OutboundProduct[]
    created_at: string
    updated_at: string
    validated_at: string
    packaged_at: string
    shipping_id: string
    shipping_status: string
    isStockReady: boolean
    productCodes: string[]
}

export interface OutboundsFilter {
    page?: number;
    sellerId?: string;
    sellerIds?: string[];
    sku?: string;
    skus?: string[];
    storeId?: number;
    storeIds?: number[];
    status?: string
}

export interface OutboundProduct {
    id: number
    status?: string
    quantity: number
    price: number
    created_at: string
    updated_at?: string
    deleted_at?: string
    returned_damaged?: string
    returned_undamaged?: string
    sku: string
    name: string
}

export interface OutboundProductsInput {
    sku: string
    quantity: number
    price: number
}

export interface OutboundCreateInput {
    warehouse_id: number
    store_id: number
    invoice_n: string
    shipping_id: string
    shipping_status: string
    name: string
    phone: string
    note?: string

    address: string
    address2?: string
    state_id: string,
    city_id: string
    zip?: string

    price: number
    freeshipping: boolean
    is_stopdesk: boolean
    has_exchange: boolean
    product_to_collect?: string

    outboundProducts: {
        create: OutboundProductsInput[]
    }
}

export interface OutboundUpdateInput {
    warehouse_id: number
    store_id: number
    invoice_n: string
    shipping_id: string
    shipping_status: string
    name: string
    phone: string
    note?: string

    address: string
    address2?: string
    state_id: string,
    city_id: string
    zip?: string

    price: number
    freeshipping: boolean
    is_stopdesk: boolean
    has_exchange: boolean
    product_to_collect?: string

    outboundProducts?: {
        create?: OutboundProductsInput[]
        update?: OutboundProductsInput[]
        delete?: string[]
    }
}

