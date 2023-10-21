import {Response, Endpoints, FetchOptions} from "../types";

export default class DataSource {
    protected readonly fetch: <T>(endpoint: string, options?: FetchOptions) => Promise<Response<T>>;
    protected readonly endpoints: Endpoints;

    constructor(fetch: <T>(endpoint: string, options?: FetchOptions) => Promise<Response<T>>, endpoints: Endpoints) {
        this.fetch = fetch;
        this.endpoints = endpoints;
    }
}
