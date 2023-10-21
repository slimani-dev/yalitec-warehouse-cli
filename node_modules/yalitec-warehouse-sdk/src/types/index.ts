import {OAuth2Token} from '@badgateway/oauth2-client';
import {Response} from "./Response";
import {ClientPasswordParams, FetchOptions, City, State, Endpoints} from "./global";
import {ClientSettings} from "@badgateway/oauth2-client/dist/client";
import {Warehouse} from "./Warehouse";
import {Store, StoreCreateInput, StoreUpdateInput} from "./Store";
import {
    Outbound,
    OutboundCreateInput,
    OutboundProduct,
    OutboundProductsInput,
    OutboundsFilter,
    OutboundUpdateInput
} from "./outbound";


import {
    Product,
    ProductCreateInput,
    ProductsFilter,
    ProductsVariantCreateInput,
    ProductsVariantUpdateInput,
    ProductUpdateInput
} from "./Product";
import {
    Inbound,
    InboundCreateInput,
    InboundProduct,
    InboundProductsCreateInput,
    InboundProductsUpdateInput,
    InboundsFilter,
    InboundUpdateInput
} from "./Inbound";


export {
    // Global Types
    Response,
    OAuth2Token,
    ClientPasswordParams,
    FetchOptions,
    ClientSettings,
    Endpoints,

    // City and State Types
    City,
    State,

    // Warehouse types
    Warehouse,

    // Store Types
    Store,
    StoreCreateInput,
    StoreUpdateInput,

    // Product Types
    Product,
    ProductsFilter,
    ProductCreateInput,
    ProductsVariantCreateInput,
    ProductsVariantUpdateInput,
    ProductUpdateInput,

    // Inbound Types
    Inbound,
    InboundsFilter,
    InboundCreateInput,
    InboundProduct,
    InboundProductsCreateInput,
    InboundProductsUpdateInput,
    InboundUpdateInput,

    // Outbound Types
    Outbound,
    OutboundsFilter,
    OutboundCreateInput,
    OutboundProduct,
    OutboundProductsInput,
    OutboundUpdateInput
}
