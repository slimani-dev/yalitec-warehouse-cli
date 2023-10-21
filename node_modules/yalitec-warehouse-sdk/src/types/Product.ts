export interface Product {
    store_id: number
    name: string
    sku: string
    category: string
    size: "small" | "medium" | "large" | "huge"
    width?: number
    height?: number
    length?: number
    weight?: number
    description?: string
    value: number
    variant?: string
    variant_of?: number
    total: number
    incoming: number
    incoming_return: number
    in_warehouse: number
    in_shelf: number
    ready: number
    delivered: number
    on_process: number
    damaged: number
    created_at: string
    updated_at: string
    variants: Product[]
}

export interface ProductsFilter {
    page?: number;
    sellerId?: string;
    sellerIds?: string[];
    sku?: string;
    skus?: string[];
    storeId?: number;
    storeIds?: number[];
}

export interface ProductsVariantCreateInput {
    sku: string,
    value: number,
    variant: string
}

export interface ProductsVariantUpdateInput {
    sku: string,
    value: number,
    variant: string
}

export interface ProductCreateInput {
    store_id: number
    name: string
    sku: string
    category: string
    size: "small" | "medium" | "large" | "huge"
    description?: string
    value: number
    variant?: string
    variant_of?: string
    variants?: {
        create: ProductsVariantCreateInput[]
    }
}

export interface ProductUpdateInput {
    store_id: number
    name: string
    category: string
    size: "small" | "medium" | "large" | "huge"
    description?: string
    value: number
    variant?: string
    variant_of?: string
    variants?: {
        create?: ProductsVariantCreateInput[]
        update?: ProductsVariantUpdateInput[]
    }
}
