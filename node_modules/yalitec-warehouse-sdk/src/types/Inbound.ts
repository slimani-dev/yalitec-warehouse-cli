export interface Inbound {
    store_id: number
    number: string
    type: "Walk In" | "Pick Up"
    status: string
    inbound_date: string
    phone: string
    note: any
    address: any
    address2: any
    zip: any
    city_id: any
    state_id: any
    warehouse_id: number
    inboundProducts: InboundProduct[]
    created_at: string
    updated_at: string
}

export interface InboundsFilter {
    page?: number;
    sellerId?: string;
    sellerIds?: string[];
    storeId?: number;
    storeIds?: number[];
}

export interface InboundProduct {
    id: number
    name: string
    quantity: number
    quantity_received: number
    expired_at: any
    created_at: string
    updated_at: string
    quantity_damaged: any
    variation: any
    deleted_at: any
    sku: string
}


export interface InboundCreateInputWalkIn {
    warehouse_id: number
    store_id: number
    type: "Walk In"
    phone: string
    note?: string
    inboundProducts: {
        create: InboundProductsCreateInput[]
    }
}

export interface InboundCreateInputPickUp {
    warehouse_id: number
    store_id: number
    type: "Pick Up"
    phone: string
    note?: string
    address: string
    address2?: string
    zip?: string
    city_id: string
    state_id: string,
    inboundProducts: {
        create: InboundProductsCreateInput[]
    }
}

export interface InboundProductsCreateInput {
    sku: string
    quantity: number
    variation?: string
    expired_at?: string
}

export type InboundCreateInput = InboundCreateInputWalkIn | InboundCreateInputPickUp;

//
export interface InboundUpdateInputWalkIn {
    warehouse_id: number
    store_id: number
    type: "Walk In"
    phone: string
    note?: string
    inboundProducts?: {
        create?: InboundProductsUpdateInput[]
        update?: InboundProductsUpdateInput[]
    }
}

export interface InboundUpdateInputPickUp {
    warehouse_id: number
    store_id: number
    type: "Pick Up"
    phone: string
    note?: string
    address: string
    address2?: string
    zip?: string
    city_id: string
    state_id: string,
    inboundProducts?: {
        create?: InboundProductsCreateInput[]
        update?: InboundProductsUpdateInput[]
    }
}

export interface InboundProductsUpdateInput {
    sku: string
    quantity: number
    variation?: string
    expired_at?: string
}

export type InboundUpdateInput = InboundUpdateInputWalkIn | InboundUpdateInputPickUp;

