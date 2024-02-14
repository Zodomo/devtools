import { EndpointId } from '@layerzerolabs/lz-definitions'
import { IncrementOutput, IncrementType, IOmniCounter } from '@layerzerolabs/omnicounter-devtools'
import { EndpointV2Factory } from '@layerzerolabs/protocol-devtools'
import { OApp } from '@layerzerolabs/ua-devtools-evm'
import { type OmniAddress, makeBytes32 } from '@layerzerolabs/devtools'
import { OmniContract } from '@layerzerolabs/devtools-evm'
import assert from 'assert'

export class OmniCounter extends OApp implements IOmniCounter {
    public constructor(
        public override contract: OmniContract,
        protected override endpointV2Factory: EndpointV2Factory
    ) {
        super(contract, endpointV2Factory)
    }

    public async increment(
        eid: EndpointId,
        type: IncrementType,
        options: Uint8Array,
        receiver: OmniAddress
    ): Promise<IncrementOutput> {
        const data = this.contract.contract.interface.encodeFunctionData('increment', [eid, type, options])
        const endpointV2Sdk = await super.getEndpointSDK()
        const messagingFee = await endpointV2Sdk.quote(
            { dstEid: eid, options, message: data, receiver: makeBytes32(receiver), payInLzToken: false },
            await this.contract.contract.getAddress()
        )
        const gasLimit = await this.contract.contract.increment?.estimateGas(eid, type, options)
        assert(gasLimit != null, 'Did not receive gas estimation from OmniCounter')

        return {
            omniTransaction: super.createTransaction(data),
            messagingFee,
            gasLimit,
        }
    }
}
