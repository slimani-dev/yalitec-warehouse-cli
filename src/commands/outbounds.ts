import {Argument, Command, Option} from "@commander-js/extra-typings";
import {confirm, input, select} from '@inquirer/prompts';
import {stateAndCitySearch} from "../data/data";


import {
    Response,
    Warehouse,
    Store,
    Product,
    Outbound,
    OutboundCreateInput,
    OutboundProduct,
    OutboundProductsInput,
    OutboundUpdateInput
} from "../../../api-sdk/src/types";
import {OutboundDataSource, ProductDataSource, StoreDataSource, WarehouseDataSource} from "yalitec-warehouse-sdk";


const page = new Option('-p, --page <page>', 'show specific page').argParser(parseInt);
const sellerId = new Option('-s, --sellerId <sellerId>', 'The Seller Id Of the Outbounds')
const sellerIds = new Option('-S, --sellerIds <sellerId...>', 'The List of Seller Ids Of the Outbounds')

const sku = new Option('-k, --sku <sku>', 'The sku of the Product Of the Outbounds')
const skus = new Option('-K, --skus <sku...>', 'The List of skus of the Products Of the Outbounds')

const storeId = new Option('-i, --storeId <storeId>', 'The store id of the Outbound').argParser(parseInt)
const storeIds = new Option('-I, --storeIds <storeId...>', 'The List of store ids of the Outbounds').argParser(
    (value: string, previous?: number[]) => {
        if (previous === undefined || !Array.isArray(previous)) {
            previous = []
        }
        previous.push(parseInt(value))
        return previous
    }
)

const status = new Option('--status <status>', 'The status of the Outbound')


const number = new Argument('<number>', 'Number of the Outbound or Shipping ID')

const getAddProducts = async () => await confirm({message: 'add products ?'});
const getUpdateProducts = async () => await confirm({message: 'update products ?'});

const addOutboundProducts = async (productDataSource: ProductDataSource, storeId: number) => {

    const create: OutboundProductsInput[] = []

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

        const price = parseInt(await input({
            message: 'Price :',
            default: product.value.toString(),
            validate: value => /^-?\d+$/.test(value)

        }))

        create.push({
            sku: product.sku,
            quantity,
            price
        })
    }
    while (await confirm({message: 'add more products ?'}))

    return create
}

const updateOutboundProducts = async (productDataSource: ProductDataSource, outboundProducts: OutboundProduct[]) => {

    const update: OutboundProductsInput[] = []

    do {
        let outboundProduct = await select({
            message: 'Product id :',
            choices: outboundProducts.map((outboundProduct: OutboundProduct) => ({
                name: `${outboundProduct.name} [${outboundProduct.sku}] X${outboundProduct.quantity}`,
                value: outboundProduct
            }))
        })

        const quantity = parseInt(await input({
            message: 'Quantity :',
            default: outboundProduct.quantity.toString(),
            validate: value => /^-?\d+$/.test(value)
        }));

        const price = parseInt(await input({
            message: 'Price :',
            default: outboundProduct.price.toString(),
            validate: value => /^-?\d+$/.test(value)

        }))

        update.push({
            sku: outboundProduct.sku,
            price,
            quantity
        })
    }
    while (await confirm({message: 'update more products ?'}))

    return update
}

export const useOutboundsCommand = (outboundDataSource: OutboundDataSource, storeDataSource: StoreDataSource, warehouseDataSource: WarehouseDataSource, productDataSource: ProductDataSource) => {
    const outbounds = new Command('outbounds')
        .description('Manage the outbounds')

    const list = new Command('list')
        .addOption(page)
        .addOption(sellerId)
        .addOption(sellerIds)
        .addOption(storeId)
        .addOption(storeIds)
        .addOption(sku)
        .addOption(skus)
        .addOption(status)
        .action(async (options) => {
            console.log('Getting a list of Outbounds')
            const outbounds = await outboundDataSource.list(options)
            console.log('inbounds : ', outbounds)
        });

    const show = new Command('show')
        .addArgument(number)
        .action(async (number) => {
            console.log('Getting a specific outbound')
            const outbound = await outboundDataSource.find(number)
            console.log('inbound : ', outbound)
        })

    const create = new Command('create')
        .description('Create a new outbound')
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

            const invoice_n = await input({message: 'Invoice No :', validate: value => !!value});
            const shipping_id = await input({message: 'Shipping Id :', validate: value => !!value});
            const shipping_status = await input({message: 'Shipping Status :', validate: value => !!value});

            const name = await input({message: 'Name :', validate: value => !!value});
            const phone = await input({message: 'Phone :', validate: value => !!value});
            const note = await input({message: 'Note   (optional) :'});
            const address = await input({message: 'Address :', validate: value => !!value});
            const address2 = await input({message: 'Address 2 (optional) :'});
            const {state_id, city_id} = await stateAndCitySearch()
            const zip = await input({message: 'Zip  (optional) :'});


            const outboundProductsCreateInputs = await addOutboundProducts(productDataSource, store.data.id);

            const freeshipping = await confirm({message: 'Free shipping ?'});
            const is_stopdesk = await confirm({message: 'Is stopdesk ?'});
            const has_exchange = await confirm({message: 'Has exchange ?'});

            const product_to_collect = has_exchange ? await input({message: 'Product to collect :'}) : '';

            const price = parseInt(await input({
                message: 'Price :',
                default: outboundProductsCreateInputs.reduce((acc, curr) => acc + curr.price * curr.quantity, 0).toString(),
                validate: value => /^-?\d+$/.test(value)
            }));

            const outboundInput: OutboundCreateInput = {
                store_id: store.data.id,
                warehouse_id,
                invoice_n,
                shipping_id,
                shipping_status,
                phone,
                name,
                note,
                address,
                address2,
                state_id,
                city_id,
                zip,

                freeshipping,
                is_stopdesk,
                has_exchange,
                product_to_collect,

                price,

                outboundProducts: {
                    create: outboundProductsCreateInputs
                },

            }

            console.log('Creating a Outbound')
            const outbound = await outboundDataSource.create(outboundInput)
            console.log('outbound : ', outbound)
        })

    const update = new Command('update')
        .description('Update an existing outbound')
        .addArgument(number)
        .action(async (number) => {
            let outbound: Response<Outbound> | null = null;

            try {
                outbound = await outboundDataSource.find(number)
            } catch (e) {
                console.log('Outbound not found ⛔, try again')
            }

            while ((!outbound?.data)) {
                const number = await input({
                    message: 'Number or Shipping Id (YAL-123|GPX-123|OTB-123):',
                    validate: value => !!value
                })

                try {
                    outbound = await outboundDataSource.find(number)
                } catch (e) {
                    console.log('Inbound not found ⛔, try again')
                }
            }

            if (!outbound) return

            let store: Response<Store> | null = null;

            do {
                const store_id = await input({
                    message: 'Store id :',
                    default: outbound?.data.store_id.toString(),
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

            const invoice_n = await input({
                message: 'Invoice No :',
                default: outbound.data.invoice_n,
                validate: value => !!value
            });
            const shipping_id = await input({
                message: 'Shipping Id :',
                default: outbound.data.shipping_id,
                validate: value => !!value
            });
            const shipping_status = await input({
                message: 'Shipping Status :',
                default: outbound.data.shipping_status,
                validate: value => !!value
            });

            const name = await input({
                message: 'Name :',
                default: outbound.data.name,
                validate: value => !!value
            });
            const phone = await input({
                message: 'Phone :',
                default: outbound.data.phone,
                validate: value => !!value
            });
            const note = await input({
                message: 'Note   (optional) :',
                default: outbound.data.note
            });
            const address = await input({
                message: 'Address :',
                default: outbound.data.address,
                validate: value => !!value
            });
            const address2 = await input({
                message: 'Address 2 (optional) :',

            });
            const {state_id, city_id} = await stateAndCitySearch(
                outbound.data.state_id,
                outbound.data.city_id
            )
            const zip = await input({
                message: 'Zip  (optional) :',
                default: outbound.data.zip
            });


            const freeshipping = await confirm({
                message: 'Free shipping ?',
                default: outbound.data.freeshipping
            });
            const is_stopdesk = await confirm({
                message: 'Is stopdesk ?',
                default: outbound.data.is_stopdesk
            });
            const has_exchange = await confirm({
                message: 'Has exchange ?',
                default: outbound.data.has_exchange
            });

            const product_to_collect = has_exchange ? await input({
                message: 'Product to collect :',
                default: outbound.data.product_to_collect
            }) : '';


            let outboundProducts: {
                create?: OutboundProductsInput[]
                update?: OutboundProductsInput[]
            } = {}

            let addProducts = await getAddProducts()
            if (addProducts) {
                outboundProducts.create = await addOutboundProducts(productDataSource, store.data.id)
            }

            let updateProducts = await getUpdateProducts()
            if (updateProducts) {
                outboundProducts.update = await updateOutboundProducts(productDataSource, outbound.data.outboundProducts)
            }

            let defaultPrice = 0
            if (outboundProducts.create) {
                defaultPrice += outboundProducts.create.reduce((acc, curr) => acc + curr.price * curr.quantity, 0)
            }
            if (outboundProducts.update) {
                defaultPrice += outboundProducts.update.reduce((acc, curr) => acc + curr.price * curr.quantity, 0)
            }


            const price = parseInt(await input({
                message: 'Price :',
                default: defaultPrice.toString(),
                validate: value => /^-?\d+$/.test(value)
            }));

            const outboundInput: OutboundUpdateInput = {
                store_id: store.data.id,
                warehouse_id,
                invoice_n,
                shipping_id,
                shipping_status,
                phone,
                name,
                note,
                address,
                address2,
                state_id,
                city_id,
                zip,

                freeshipping,
                is_stopdesk,
                has_exchange,
                product_to_collect,

                price
            }

            if (Object.keys(outboundProducts).length) {
                outboundInput.outboundProducts = outboundProducts
            }

            console.log(`Updating ${outbound.data.number}`)

            outbound = await outboundDataSource.update(outbound.data.number, outboundInput);
            console.log('inbound : ', outbound)
        })

    outbounds.addCommand(list)
    outbounds.addCommand(show)
    outbounds.addCommand(create)
    outbounds.addCommand(update)

    return outbounds
}
