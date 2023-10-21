#!/usr/bin/env node
import 'dotenv/config'

import {Command} from "@commander-js/extra-typings";

import {useWarehousesCommand} from './commands/warehouses'
import {useStoresCommand} from "./commands/stores";
import {useProductsCommand} from "./commands/products";
import {useInboundsCommand} from "./commands/inbounds";
import {useOutboundsCommand} from "./commands/outbounds";

import loading from "loading-cli";

import {
    WarehouseDataSource, StoreDataSource, ProductDataSource, InboundDataSource, OutboundDataSource,
    useFetch, useConfig
} from "yalitec-warehouse-sdk";

const server = process.env.YALITEC_WAREHOUSE_API_SERVER_HOSTNAME || "https://beta-api.slimani.dev"
const clientId = process.env.YALITEC_WAREHOUSE_API_CLIENT_ID || "2"
const clientSecret = process.env.YALITEC_WAREHOUSE_API_CLIENT_SECRET
const tokenEndpoint = "/oauth/token"
const username = process.env.YALITEC_WAREHOUSE_API_CLIENT_USERNAME || "admin"
const password = process.env.YALITEC_WAREHOUSE_API_CLIENT_PASSWORD || "password"

if (!clientSecret) {
    console.log('You must at least provide a client secret')
    process.exit(0)
}

const {clientPasswordParams, clientSettings, endpoints} = useConfig({
    server, clientId, clientSecret, tokenEndpoint, username, password
})

const {fetch, scheduleRefresh} = useFetch({
    clientSettings,
    clientPasswordParams,
    storeTokenCallback: token => {
        console.log(token)
        // scheduleRefresh(token)
    },
    getStoredTokenCallback: () => ({
        accessToken: process.env.YALITEC_WAREHOUSE_API_CLIENT_TOKEN || "",
        expiresAt: parseInt(process.env.YALITEC_WAREHOUSE_API_CLIENT_EXPIRES_AT || "0"),
        refreshToken: process.env.YALITEC_WAREHOUSE_API_CLIENT_REFRESH_TOKEN || ""
    }),

    loader: loading({
        text: "",
        stream: process.stdout,
        frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    })
})

const warehouseDataSource = new WarehouseDataSource(fetch, endpoints)
const storeDataSource = new StoreDataSource(fetch, endpoints)
const productDataSource = new ProductDataSource(fetch, endpoints)
const inboundDataSource = new InboundDataSource(fetch, endpoints)
const outboundDataSource = new OutboundDataSource(fetch, endpoints)

const warehouseCommand = useWarehousesCommand(warehouseDataSource)
const storeCommand = useStoresCommand(storeDataSource)
const productCommand = useProductsCommand(productDataSource, storeDataSource)
const inboundCommand = useInboundsCommand(inboundDataSource, storeDataSource, warehouseDataSource, productDataSource)
const outboundCommand = useOutboundsCommand(outboundDataSource, storeDataSource, warehouseDataSource, productDataSource)

const program = new Command();

program.description('CLI to use the Warehouse api')
    .version("0.0.10")
    .addCommand(warehouseCommand)
    .addCommand(storeCommand)
    .addCommand(productCommand)
    .addCommand(inboundCommand)
    .addCommand(outboundCommand)

program.parse()
