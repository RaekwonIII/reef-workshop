import * as ethers from 'ethers'
import {LogEvent, Func, ContractBase} from './abi.support'
import {ABI_JSON} from './reef.abi'

export const abi = new ethers.utils.Interface(ABI_JSON);

export const events = {
    Approval: new LogEvent<([owner: string, spender: string, value: ethers.BigNumber] & {owner: string, spender: string, value: ethers.BigNumber})>(
        abi, '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
    ),
    Transfer: new LogEvent<([from: string, to: string, value: ethers.BigNumber] & {from: string, to: string, value: ethers.BigNumber})>(
        abi, '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    ),
}

export const functions = {
    currencyId: new Func<[], {}, ethers.BigNumber>(
        abi, '0x1feeece2'
    ),
    name: new Func<[], {}, string>(
        abi, '0x06fdde03'
    ),
    symbol: new Func<[], {}, string>(
        abi, '0x95d89b41'
    ),
    decimals: new Func<[], {}, number>(
        abi, '0x313ce567'
    ),
    totalSupply: new Func<[], {}, ethers.BigNumber>(
        abi, '0x18160ddd'
    ),
    balanceOf: new Func<[account: string], {account: string}, ethers.BigNumber>(
        abi, '0x70a08231'
    ),
    transfer: new Func<[recipient: string, amount: ethers.BigNumber], {recipient: string, amount: ethers.BigNumber}, boolean>(
        abi, '0xa9059cbb'
    ),
    allowance: new Func<[owner: string, spender: string], {owner: string, spender: string}, ethers.BigNumber>(
        abi, '0xdd62ed3e'
    ),
    approve: new Func<[spender: string, amount: ethers.BigNumber], {spender: string, amount: ethers.BigNumber}, boolean>(
        abi, '0x095ea7b3'
    ),
    transferFrom: new Func<[sender: string, recipient: string, amount: ethers.BigNumber], {sender: string, recipient: string, amount: ethers.BigNumber}, boolean>(
        abi, '0x23b872dd'
    ),
    increaseAllowance: new Func<[spender: string, addedValue: ethers.BigNumber], {spender: string, addedValue: ethers.BigNumber}, boolean>(
        abi, '0x39509351'
    ),
    decreaseAllowance: new Func<[spender: string, subtractedValue: ethers.BigNumber], {spender: string, subtractedValue: ethers.BigNumber}, boolean>(
        abi, '0xa457c2d7'
    ),
}

export class Contract extends ContractBase {

    currencyId(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.currencyId, [])
    }

    name(): Promise<string> {
        return this.eth_call(functions.name, [])
    }

    symbol(): Promise<string> {
        return this.eth_call(functions.symbol, [])
    }

    decimals(): Promise<number> {
        return this.eth_call(functions.decimals, [])
    }

    totalSupply(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.totalSupply, [])
    }

    balanceOf(account: string): Promise<ethers.BigNumber> {
        return this.eth_call(functions.balanceOf, [account])
    }

    allowance(owner: string, spender: string): Promise<ethers.BigNumber> {
        return this.eth_call(functions.allowance, [owner, spender])
    }
}
