import 'hardhat'
import { createGetHreByEid } from '@/runtime'
import { EndpointId } from '@layerzerolabs/lz-definitions'
import { createProviderFactory } from '@/provider'
import { JsonRpcProvider, Network } from 'ethers'
import { HardhatEthersProvider } from '@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider'

// Ethers calls the eth_chainId RPC method when initializing a provider so we mock the result
jest.spyOn(JsonRpcProvider.prototype, '_detectNetwork').mockResolvedValue(new Network('mock', BigInt(1)))

describe('provider', () => {
    describe('createProviderFactory', () => {
        it('should reject with an endpoint that is not in the hardhat config', async () => {
            const environmentFactory = createGetHreByEid()
            const providerFactory = createProviderFactory(environmentFactory)

            await expect(providerFactory(EndpointId.CATHAY_TESTNET)).rejects.toBeTruthy()
        })

        it('should return a JsonRpcProvider wrapping the network provider', async () => {
            const environmentFactory = createGetHreByEid()
            const providerFactory = createProviderFactory(environmentFactory)
            const env = await environmentFactory(EndpointId.ETHEREUM_V2_MAINNET)
            const provider = await providerFactory(EndpointId.ETHEREUM_V2_MAINNET)

            expect(provider).toBeInstanceOf(HardhatEthersProvider)

            // Here we're checking that the provider is configured with the correct network provider
            jest.spyOn(env.network.provider, 'send').mockResolvedValue('sent')
            expect(await provider.send('dummy', [])).toBe('sent')

            provider.destroy()
        })
    })
})
