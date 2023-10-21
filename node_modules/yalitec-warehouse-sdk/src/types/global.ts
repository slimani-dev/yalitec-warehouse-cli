export interface FetchOptions {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
}

export interface ClientPasswordParams {
    username: string;
    password: string;
    scope?: string[]
}

export interface City {
    id: number
    name: string
    state_id: number
    stop_desk?: boolean,
    created_at?: any;
    updated_at?: any;
}

export interface State {
    id: number
    name: string
    zone?: number
    created_at?: any;
    updated_at?: any;
}

export interface Endpoints {
    [key: string]: {
        index: string,
        create: string,
        show(id: (number | string)): string,
        update(id: (number | string)): string,
        delete(id: (number | string)): string
    }
}
