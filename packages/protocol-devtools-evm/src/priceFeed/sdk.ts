import type { EndpointId } from '@layerzerolabs/lz-definitions'
import type { IPriceFeed, PriceData } from '@layerzerolabs/protocol-devtools'
import { formatEid, type OmniTransaction } from '@layerzerolabs/devtools'
import { OmniSDK } from '@layerzerolabs/devtools-evm'
import { printRecord } from '@layerzerolabs/io-devtools'
import { PriceDataSchema } from './schema'

export class PriceFeed extends OmniSDK implements IPriceFeed {
    async getPrice(eid: EndpointId): Promise<PriceData> {
        const config = await this.contract.contract['getPrice(uint32)'](eid)

        // Now we convert the ethers-specific object into the common structure
        //
        // Here we need to spread the config into an object because what ethers gives us
        // is actually an array with extra properties
        return PriceDataSchema.parse({ ...config })
    }

    async setPrice(eid: EndpointId, priceData: PriceData): Promise<OmniTransaction> {
        const data = this.contract.contract.interface.encodeFunctionData('setPrice', [
            [
                {
                    eid,
                    price: priceData,
                },
            ],
        ])

        return {
            ...this.createTransaction(data),
            description: `Setting price for ${formatEid(eid)}: ${printRecord(priceData)}`,
        }
    }
}
