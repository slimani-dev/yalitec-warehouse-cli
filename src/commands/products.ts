import {Argument, Command, Option} from "@commander-js/extra-typings";
import {input, select, confirm} from '@inquirer/prompts';
import {
    Store,
    Response,
    Product,
    ProductCreateInput,
    ProductsVariantCreateInput,
    ProductsVariantUpdateInput,
    ProductUpdateInput
} from "yalitec-warehouse-sdk/src/types";
import {ProductDataSource, StoreDataSource} from "yalitec-warehouse-sdk";


const page = new Option('-p, --page <page>', 'show specific page').argParser(parseInt);
const sellerId = new Option('-s, --sellerId <sellerId>', 'The Seller Id Of the Products')
const sellerIds = new Option('-S, --sellerIds <sellerId...>', 'The List of Seller Ids Of the Products')

const sku = new Option('-k, --sku <sku>', 'The sku of the Product')
const skus = new Option('-K, --skus <sku...>', 'The List of skus of the Products')

const storeId = new Option('-i, --storeId <storeId>', 'The store id of the Product').argParser(parseInt)
const storeIds = new Option('-I, --storeIds <storeId...>', 'The List of store ids of the Products').argParser(
    (value: string, previous?: number[]) => {
        if (previous === undefined || !Array.isArray(previous)) {
            previous = []
        }
        previous.push(parseInt(value))
        return previous
    }
)

const skuArg = new Argument('<sku>', 'The sku of the Product')

const getAddVariants = async () => await confirm({message: 'add variants ?'});
const getUpdateVariants = async () => await confirm({message: 'update variants ?'});
export const useProductsCommand = (productDataSource: ProductDataSource, storeDataSource: StoreDataSource) => {
    const products = new Command('products')
        .description('Manage the products')

    const list = new Command('list')
        .addOption(page)
        .addOption(sellerId)
        .addOption(sellerIds)
        .addOption(sku)
        .addOption(skus)
        .addOption(storeId)
        .addOption(storeIds)
        .action(async (options) => {
            console.log('Getting a list of products')
            const products = await productDataSource.list(options)
            console.log('products : ', products)
        });

    const show = new Command('show')
        .addArgument(skuArg)
        .action(async (sku) => {
            console.log('Getting a specific product')
            const product = await productDataSource.find(sku)
            console.log('product : ', product)
        })

    const create = new Command('create')
        .description('Create a new product')
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

            const productInput: ProductCreateInput = {
                store_id: store.data.id,
                name: await input({message: 'Name :', validate: value => !!value}),
                sku: await input({message: 'SKU :', validate: value => !!value}),
                category: await input({message: 'Category (optional):'}),
                size: await select({
                    message: 'Size :',
                    choices: [{value: 'small'}, {value: 'medium'}, {value: 'large'}, {value: 'huge'}]
                }),
                description: await input({message: 'Description (optional):'}),
                value: parseInt(await input({message: 'Value :', validate: value => /^-?\d+$/.test(value)})),
                variant: await input({message: 'Variant (optional):'}),
                variant_of: await input({
                    message: 'variant_of (SKU) (optional):',
                    validate: value => value === '' || /^-?\d+$/.test(value)
                }),
            }

            let addVariants = await getAddVariants()
            const create: ProductsVariantCreateInput[] = []

            while (addVariants) {
                console.log('Adding a variant :')
                create.push({
                    sku: await input({
                        message: 'SKU :',
                        default: productInput.sku + (create.length + 1),
                        validate: value => !!value
                    }),
                    value: parseInt(await input({
                        message: 'Value :',
                        default: productInput.value.toString(),
                        validate: value => /^-?\d+$/.test(value)
                    })),
                    variant: await input({message: 'Variant :'}),
                })
                addVariants = await getAddVariants()
            }

            if (create.length > 0) {
                productInput.variants = {create}
            }


            console.log('Creating a product')

            const product = await productDataSource.create(productInput)
            console.log('product : ', product)
        })

    const update = new Command('update')
        .description('Update an existing product')
        .addArgument(skuArg)
        .action(async (skuArg) => {
            let product: Response<Product> | null = null;

            try {
                product = await productDataSource.find(skuArg)
            } catch (e) {
                console.log('Product not found ⛔, try again')
            }

            while (!product?.data) {
                const sku = await input({message: 'SKU :', validate: value => !!value})

                try {
                    product = await productDataSource.find(sku)
                } catch (e) {
                    console.log('Product not found ⛔, try again')
                }
            }

            let store: Response<Store> | null = null;

            do {
                const store_id = await input({
                    message: 'Store id :',
                    default: product.data.store_id.toString(),
                    validate: value => /^-?\d+$/.test(value)
                })
                try {
                    store = await storeDataSource.find(parseInt(store_id))
                } catch (e) {
                    console.log('Store not found ⛔, try again')
                }

            } while ((!store?.data))

            console.log('Store Found, store name : ', store.data.name)

            const productInput: ProductUpdateInput = {
                store_id: store.data.id,
                name: await input({
                    message: 'Name :',
                    default: product.data.name,
                    validate: value => !!value
                }),
                category: await input({
                    message: 'Category (optional):',
                    default: product.data.category
                }),
                size: await select({
                    message: 'Size :',
                    choices: [
                        {value: 'small'},
                        {value: 'medium'},
                        {value: 'large'},
                        {value: 'huge'}
                    ]
                }),
                description: await input({message: 'Description (optional):', default: product.data.description}),
                value: parseInt(await input({
                    message: 'Value :',
                    default: product.data.value.toString(),
                    validate: value => /^-?\d+$/.test(value)
                })),
                variant: await input({
                    message: 'Variant (optional):',
                    default: product.data.variant
                }),
                variant_of: await input({
                    message: 'variant_of (SKU) (optional):',
                    default: product.data.variant_of?.toString(),
                    validate: value => value === '' || /^-?\d+$/.test(value)
                }),
            }

            let addVariants = await getAddVariants()
            const create: ProductsVariantCreateInput[] = []

            while (addVariants) {
                console.log('Adding a variant :')
                create.push({
                    sku: await input({
                        message: 'SKU :',
                        default: product.data.sku + (create.length + product.data.variants?.length + 1),
                        validate: value => !!value
                    }),
                    value: parseInt(await input({
                        message: 'Value :',
                        default: productInput.value.toString(),
                        validate: value => /^-?\d+$/.test(value)
                    })),
                    variant: await input({message: 'Variant :'}),
                })
                addVariants = await getAddVariants()
            }

            const update: ProductsVariantUpdateInput[] = []
            // update variants
            if (product.data.variants) {
                let updateVariants = await getUpdateVariants()

                let choices = [
                    ...product.data.variants
                        .map(variant => ({value: variant.sku}))]

                while (updateVariants && choices.length) {
                    console.log('Updating a variant :')

                    let sku = await select({
                        message: 'SKU :',
                        choices
                    })

                    update.push({
                        sku,
                        value: parseInt(await input({
                            message: 'Value :',
                            default: productInput.value.toString(),
                            validate: value => /^-?\d+$/.test(value)
                        })),
                        variant: await input({
                            message: 'Variant :',
                            default: product.data.variants.find(variant => variant.sku === sku)?.variant
                        }),
                    })


                    updateVariants = await getUpdateVariants()
                    choices = [
                        ...product.data.variants
                            .filter(value => !update.map(u => u.sku).includes(value.sku))
                            .map(variant => ({value: variant.sku}))]
                }
            }

            if (create.length > 0) {
                productInput.variants = {create}
            }

            if (update.length > 0) {
                productInput.variants = {
                    ...productInput.variants,
                    update
                }
            }


            console.log(`Updating ${product.data.sku}`)

            product = await productDataSource.update(product.data.sku, productInput);
            console.log('product : ', product)
        })

    products.addCommand(list)
    products.addCommand(show)
    products.addCommand(create)
    products.addCommand(update)

    return products
}
