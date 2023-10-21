export interface Store {
    id: number
    seller_id: string
    name: string
    phone: string
    description?: string
    state_id?: number
    city_id?: number
    created_at: string
    updated_at: string
}

export interface StoreCreateInput {
    seller_id: string
    name: string
    phone: string
    description?: string
    state_id?: number
    city_id?: number
}

export interface StoreUpdateInput {
    seller_id?: string
    name?: string
    phone?: string
    description?: string
    state_id?: number
    city_id?: number
}
