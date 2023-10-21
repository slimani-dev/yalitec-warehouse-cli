import {OAuth2Client, OAuth2Fetch} from '@badgateway/oauth2-client';
import {ClientPasswordParams, FetchOptions, ClientSettings, OAuth2Token, Response} from "../types";

let refreshTimer: NodeJS.Timeout | null = null;

const MAX_INT32 = 2147483647;

export const useFetch = (
    config: {
        clientSettings: ClientSettings,
        clientPasswordParams: ClientPasswordParams,
        storeTokenCallback: (token: OAuth2Token) => void,
        getStoredTokenCallback: () => OAuth2Token | null,
        loader?: {
            start: () => void,
            stop: () => void
        }
    }
) => {

    const {
        clientSettings,
        clientPasswordParams,
        storeTokenCallback,
        getStoredTokenCallback,
        loader
    } = config

    const client = new OAuth2Client(clientSettings);

    const fetchWrapper = new OAuth2Fetch({
        client,
        scheduleRefresh: false,
        getNewToken: async () => {
            return client.password(clientPasswordParams)
        },
        onError: (err) => {
            console.log("error : ", err.message)
        },
        storeToken: (token) => {
            storeTokenCallback(token)
        },
        getStoredToken: () => {
            return getStoredTokenCallback();
        }
    });

    const scheduleRefresh = (token: OAuth2Token) => {

        if (refreshTimer) {
            clearTimeout(refreshTimer);
            refreshTimer = null;
        }

        if (!token?.expiresAt || !token.refreshToken) {
            // If we don't know when the token expires, or don't have a refresh_token, don't bother.
            return;
        }

        const expiresIn = token.expiresAt - Date.now();

        // We only schedule this event if it happens more than 2 minutes in the future.
        if (expiresIn < 120 * 1000) {
            return;
        }

        // Schedule 1 minute before expiry
        const ms = Math.min(expiresIn - 60 * 1000, MAX_INT32 - 1);

        refreshTimer = setTimeout(async () => {
            try {
                fetchWrapper.refreshToken().then();
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('[fetch-mw-oauth2] error while doing a background OAuth2 auto-refresh', err);
            }
        }, ms);

    }

    const fetch = async <T>(endpoint: string, options?: FetchOptions) => {

        loader?.start()

        const response = await fetchWrapper.fetch(endpoint, {
            ...options,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            redirect: 'follow'
        })

        loader?.stop()

        if (!response.ok) {
            let message = await response.text();
            throw new Error(message)
        } else {
            return await response.json() as Promise<Response<T>>;
        }
    };

    return {
        fetch,
        scheduleRefresh
    }
}
