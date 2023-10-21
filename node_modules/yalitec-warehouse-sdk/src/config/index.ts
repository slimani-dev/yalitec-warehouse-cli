import {getEndpoints} from "./endpoints";
import {ClientPasswordParams, ClientSettings} from "../types/";

export const useConfig = (
    config: {
        server?: string,
        clientId?: string,
        clientSecret: string,
        tokenEndpoint?: string,
        username: string,
        password: string
    }
) => {

    const {
        server = "https://beta-api.slimani.dev",
        clientId = "2",
        clientSecret,
        tokenEndpoint = "/oauth/token",
        password = "admin",
        username = "password"
    } = config

    const clientSettings: ClientSettings = {
        server,
        clientId,
        clientSecret: clientSecret,
        tokenEndpoint,
    };

    const clientPasswordParams: ClientPasswordParams = {
        username, password,
    }

    const endpoints = getEndpoints(server)

    return {clientSettings, clientPasswordParams, endpoints}
}
