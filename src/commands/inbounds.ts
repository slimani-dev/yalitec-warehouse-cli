import {Argument, Command, Option} from "@commander-js/extra-typings";
import {confirm, input, select} from '@inquirer/prompts';
import {stateAndCitySearch} from "../data/data";

import {
    Response,
    Warehouse,
    Store,
    Product,
    Inbound,
    InboundCreateInput,
    InboundProduct,
    InboundProductsCreateInput,
    InboundProductsUpdateInput,
    InboundUpdateInput
} from "yalitec-warehouse-sdk/src/types";
import {InboundDataSource, ProductDataSource, StoreDataSource, WarehouseDataSource} from "yalitec-warehouse-sdk";


const page = new Option('-p, --page <page>', 'show specific page').argParser(parseInt);
const sellerId = new Option('-s, --sellerId <sellerId>', 'The Seller Id Of the Inbounds')
const sellerIds = new Option('-S, --sellerIds <sellerId...>', 'The List of Seller Ids Of the Inbounds')

const storeId = new Option('-i, --storeId <storeId>', 'The store id of the Inbound').argParser(parseInt)
const storeIds = new Option('-I, --storeIds <storeId...>', 'The List of store ids of the Inbounds').argParser(
    (value: string, previous?: number[]) => {
        if (previous === undefined || !Array.isArray(previous)) {
            previous = []
        }
        previous.push(parseInt(value))
        return previous
    }
)

const number = new Argument('<number>', 'id of the Inbound')

const getAddProducts = async () => await confirm({message: 'add products ?'});
const getUpdateProducts = async () => await confirm({message: 'update products ?'});

const addInboundProducts = async (productDataSource: ProductDataSource, storeId: number) => {

    const create: InboundProductsCreateInput[] = []

    console.log('Getting Store products')
    const products: Product[] = [];
    let page = 1;
    let total = 0;
    do {
        const productsList = await productDataSource.list({storeId, page})
        products.push(...productsList.data)
        total = productsList.meta?.total || 0
        page++
    } while (products.length < total)

    do {
        let product = await select({
            message: 'Product id :',
            choices: products.map((product: Product) => ({
                name: `${product.name} ${product.variant ? ': ' + product.variant : ''} [${product.sku}]`,
                value: product
            }))
        })

        if (product.variants.length) {
            product = await select({
                message: 'Variant :',
                choices: product.variants.map((variant: Product) => ({
                    name: `${variant.name} ${variant.variant ? ': ' + variant.variant : ''} [${variant.sku}]`,
                    value: variant
                }))
            })
        }

        const quantity = parseInt(await input({
            message: 'Quantity :',
            validate: value => /^-?\d+$/.test(value)
        }));

        create.push({
            sku: product.sku,
            variation: product.variant,
            quantity
        })
    }
    while (await confirm({message: 'add more products ?'}))

    return create
}

const updateInboundProducts = async (productDataSource: ProductDataSource, inboundProducts: InboundProduct[]) => {

    const update: InboundProductsUpdateInput[] = []

    do {
        let inboundProduct = await select({
            message: 'Product id :',
            choices: inboundProducts.map((inboundProduct: InboundProduct) => ({
                name: `${inboundProduct.name} ${inboundProduct.variation ? ': ' + inboundProduct.variation : ''} [${inboundProduct.sku}]`,
                value: inboundProduct
            }))
        })

        const quantity = parseInt(await input({
            message: 'Quantity :',
            default: inboundProduct.quantity.toString(),
            validate: value => /^-?\d+$/.test(value)
        }));

        update.push({
            sku: inboundProduct.sku,
            variation: inboundProduct.variation,
            quantity
        })
    }
    while (await confirm({message: 'update more products ?'}))

    return update
}

export const useInboundsCommand = (inboundDataSource: InboundDataSource, storeDataSource: StoreDataSource, warehouseDataSource: WarehouseDataSource, productDataSource: ProductDataSource) => {
    const inbounds = new Command('inbounds')
        .description('Manage the inbounds')

    const list = new Command('list')
        .addOption(page)
        .addOption(sellerId)
        .addOption(sellerIds)
        .addOption(storeId)
        .addOption(storeIds)
        .action(async (options) => {
            console.log('Getting a list of inbounds')
            const inbounds = await inboundDataSource.list(options)
            console.log('inbounds : ', inbounds)
        });

    const show = new Command('show')
        .addArgument(number)
        .action(async (number) => {
            console.log('Getting a specific inbound')
            const inbound = await inboundDataSource.find(number)
            console.log('inbound : ', inbound)
        })

    const create = new Command('create')
        .description('Create a new inbound')
        .action(async (options) => {
            let store: Response<Store> | null = null;

            do {
                const store_id = await input({message: 'Store id :', validate: value => /^-?\d+$/.test(value)})
                try {
                    store = await storeDataSource.find(parseInt(store_id))
                } catch (e) {
                    console.log('Store not found ⛔, try again')
                }

            } while ((!store?.data))


            console.log('Store Found, store name : ', store.data.name)

            let warehouses = await warehouseDataSource.list();

            if (!warehouses.data.length) {
                throw new Error('Error getting warehouses');
            }

            let choices: {
                value: number;
                name?: string;
            }[] = warehouses.data.map((warehouse: Warehouse) => ({name: warehouse.name, value: warehouse.id}));

            const warehouse_id = await select({
                message: 'Warehouse id :',
                choices
            })

            let phone = await input({
                message: 'Phone :',
                validate: value => !!value
            });

            let type: 'Walk In' | 'Pick Up' = await select({
                message: 'Type :',
                choices: [
                    {value: 'Walk In'},
                    {value: 'Pick Up'}
                ]
            });

            let note = await input({message: 'Note   (optional) :'});

            let inboundInput: InboundCreateInput;

            if (type === 'Walk In') {
                inboundInput = {
                    store_id: store.data.id,
                    warehouse_id: warehouse_id,
                    phone,
                    type,
                    note,
                    inboundProducts: {
                        create: await addInboundProducts(productDataSource, store.data.id)
                    }
                }
            } else {
                inboundInput = {
                    store_id: store.data.id,
                    warehouse_id: warehouse_id,
                    phone,
                    type,
                    note,
                    address: await input({
                        message: 'Address :',
                        validate: value => !!value
                    }),
                    address2: await input({message: 'Address 2 (optional) :'}),
                    ...(await stateAndCitySearch()),
                    zip: await input({message: 'Zip  (optional) :'}),
                    inboundProducts: {
                        create: await addInboundProducts(productDataSource, store.data.id)
                    }
                }
            }

            console.log('Creating a inbound')
            const inbound = await inboundDataSource.create(inboundInput)
            console.log('inbound : ', inbound)
        })

    const update = new Command('update')
        .description('Update an existing inbound')
        .addArgument(number)
        .action(async (number) => {
            let inbound: Response<Inbound> | null = null;

            try {
                inbound = await inboundDataSource.find(number)
            } catch (e) {
                console.log('Inbound not found ⛔, try again')
            }

            while ((!inbound?.data)) {
                const number = await input({
                    message: 'Number :',
                    transformer: value => `INB-${value}`,
                    validate: value => !!value
                })

                try {
                    inbound = await inboundDataSource.find(`INB-${number}`)
                } catch (e) {
                    console.log('Inbound not found ⛔, try again')
                }
            }

            if (!inbound) return

            let store: Response<Store> | null = null;

            do {
                const store_id = await input({
                    message: 'Store id :',
                    default: inbound?.data.store_id.toString(),
                    validate: value => /^-?\d+$/.test(value)
                })
                try {
                    store = await storeDataSource.find(parseInt(store_id))
                } catch (e) {
                    console.log('Store not found ⛔, try again')
                }

            } while ((!store?.data))

            console.log('Store Found, store name : ', store.data.name)

            let warehouses = await warehouseDataSource.list();

            if (!warehouses.data.length) {
                throw new Error('Error getting warehouses');
            }

            let choices: {
                value: number;
                name?: string;
            }[] = warehouses.data.map((warehouse: Warehouse) => ({name: warehouse.name, value: warehouse.id}));

            const warehouse_id = await select({
                message: 'Warehouse id :',
                choices
            })

            let phone = await input({
                message: 'Phone :',
                default: inbound.data.phone,
                validate: value => !!value
            });

            const typeChoices = (type: 'Walk In' | 'Pick Up') => {
                let c: {
                    name?: string;
                    value: 'Walk In' | 'Pick Up';
                }[] = [
                    {value: 'Walk In'},
                    {value: 'Pick Up'}
                ]

                c = c.filter(choice => choice.value !== type)
                c.unshift({name: `${type} (Old Value) : `, value: type})

                return c
            }

            let type: 'Walk In' | 'Pick Up' = await select({
                message: 'Type :',
                choices: typeChoices(inbound.data.type)
            });

            let note = await input({message: 'Note   (optional) :', default: inbound.data.note});

            let inboundInput: InboundUpdateInput;

            if (type === 'Walk In') {
                inboundInput = {
                    store_id: store.data.id,
                    warehouse_id: warehouse_id,
                    phone,
                    type,
                    note,
                }
            } else {
                inboundInput = {
                    store_id: store.data.id,
                    warehouse_id: warehouse_id,
                    phone,
                    type,
                    note,
                    address: await input({
                        message: 'Address :',
                        default: inbound.data.address,
                        validate: value => !!value
                    }),
                    address2: await input({
                        message: 'Address 2 (optional) :',
                        default: inbound.data.address2
                    }),
                    ...(await stateAndCitySearch(inbound.data.state_id, inbound.data.city_id)),
                    zip: await input({
                        message: 'Zip  (optional) :',
                        default: inbound.data.zip
                    }),
                }
            }

            let inboundProducts: {
                create?: InboundProductsCreateInput[]
                update?: InboundProductsUpdateInput[]
            } = {}

            let addProducts = await getAddProducts()
            if (addProducts) {
                inboundProducts.create = await addInboundProducts(productDataSource, store.data.id)
            }

            let updateProducts = await getUpdateProducts()
            if (updateProducts) {
                inboundProducts.update = await updateInboundProducts(productDataSource, inbound.data.inboundProducts)
            }

            if (Object.keys(inboundProducts).length) {
                inboundInput.inboundProducts = inboundProducts
            }

            console.log(`Updating ${inbound.data.number}`)

            inbound = await inboundDataSource.update(inbound.data.number, inboundInput);
            console.log('inbound : ', inbound)
        })

    inbounds.addCommand(list)
    inbounds.addCommand(show)
    inbounds.addCommand(create)
    inbounds.addCommand(update)

    return inbounds
}
