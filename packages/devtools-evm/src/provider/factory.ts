import pMemoize from 'p-memoize'
import { ProviderFactory, RpcUrlFactory } from './types'
import { JsonRpcProvider } from 'ethers'

export const createProviderFactory = (urlFactory: RpcUrlFactory): ProviderFactory<JsonRpcProvider> =>
    pMemoize(async (eid) => new JsonRpcProvider(await urlFactory(eid)))
