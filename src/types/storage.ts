import assert from 'assert'
import {Block, BlockContext, Chain, ChainContext, Option, Result, StorageBase} from './support'

export class EvmAccountsEvmAddressesStorage extends StorageBase {
    protected getPrefix() {
        return 'EvmAccounts'
    }

    protected getName() {
        return 'EvmAddresses'
    }

    get isV5(): boolean {
        return this.getTypeHash() === 'aedc9d9adf78c2e711b858d1696263a8b674eb7b149cc3ba7ab036d78ef5720d'
    }

    get asV5(): EvmAccountsEvmAddressesStorageV5 {
        assert(this.isV5)
        return this as any
    }
}

export interface EvmAccountsEvmAddressesStorageV5 {
    get(key: Uint8Array): Promise<(Uint8Array | undefined)>
    getAll(): Promise<Uint8Array[]>
    getMany(keys: Uint8Array[]): Promise<(Uint8Array | undefined)[]>
    getKeys(): Promise<Uint8Array[]>
    getKeys(key: Uint8Array): Promise<Uint8Array[]>
    getKeysPaged(pageSize: number): AsyncIterable<Uint8Array[]>
    getKeysPaged(pageSize: number, key: Uint8Array): AsyncIterable<Uint8Array[]>
    getPairs(): Promise<[k: Uint8Array, v: Uint8Array][]>
    getPairs(key: Uint8Array): Promise<[k: Uint8Array, v: Uint8Array][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: Uint8Array, v: Uint8Array][]>
    getPairsPaged(pageSize: number, key: Uint8Array): AsyncIterable<[k: Uint8Array, v: Uint8Array][]>
}
