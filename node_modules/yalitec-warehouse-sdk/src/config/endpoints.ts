import {Endpoints} from "../types";

export const getEndpoints = (server: string): Endpoints => {
    return {
        warehouses: {
            index: `${server}/api/warehouses`,
            create: `${server}/api/warehouses`,
            show: (id: number) => `${server}/api/warehouses/${id}`,
            update: (id: number) => `${server}/api/warehouses/${id}`,
            delete: (id: number) => `${server}/api/warehouses/${id}`
        },
        stores: {
            index: `${server}/api/stores`,
            create: `${server}/api/stores`,
            show: (id: number) => `${server}/api/stores/${id}`,
            update: (id: number) => `${server}/api/stores/${id}`,
            delete: (id: number) => `${server}/api/stores/${id}`
        },
        products: {
            index: `${server}/api/products`,
            create: `${server}/api/products`,
            show: (sku: string) => `${server}/api/products/${sku}`,
            update: (sku: string) => `${server}/api/products/${sku}`,
            delete: (sku: string) => `${server}/api/products/${sku}`
        },
        inbounds: {
            index: `${server}/api/inbounds`,
            create: `${server}/api/inbounds`,
            show: (number: string) => `${server}/api/inbounds/${number}`,
            update: (number: string) => `${server}/api/inbounds/${number}`,
            delete: (number: string) => `${server}/api/inbounds/${number}`
        },
        outbounds: {
            index: `${server}/api/outbounds`,
            create: `${server}/api/outbounds`,
            show: (number: string) => `${server}/api/outbounds/${number}`,
            update: (number: string) => `${server}/api/outbounds/${number}`,
            delete: (number: string) => `${server}/api/outbounds/${number}`
        }
    };
}

