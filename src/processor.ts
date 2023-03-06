import {lookupArchive} from "@subsquid/archive-registry"
import * as ss58 from "@subsquid/ss58"
import {BatchContext, BatchProcessorItem, SubstrateBatchProcessor} from "@subsquid/substrate-processor"
import {Store, TypeormDatabase} from "@subsquid/typeorm-store"
import {In} from "typeorm"
import { getContractEntity } from "./contract"
import {Account, Transfer} from "./model"
import {BalancesTransferEvent} from "./types/events"


const processor = new SubstrateBatchProcessor()
    .setDataSource({
        archive: lookupArchive('reef'),
        chain: "wss://rpc.reefscan.info/ws"
    })
    .addEvent('Balances.Transfer', {
        data: {
            event: {
                args: true,
                extrinsic: {
                    hash: true,
                    fee: true
                }
            }
        }
    } as const)


type Item = BatchProcessorItem<typeof processor>
export type Ctx = BatchContext<Store, Item>


processor.run(new TypeormDatabase(), async ctx => {
    let transfersData = getTransfers(ctx)

    let accountIds = new Set<string>()
    for (let t of transfersData) {
        accountIds.add(t.from)
        accountIds.add(t.to)
    }

    let accounts = await ctx.store.findBy(Account, {id: In([...accountIds])}).then(accounts => {
        return new Map(accounts.map(a => [a.id, a]))
    })

    let transfers: Transfer[] = []

    for (let t of transfersData) {
        let {id, blockNumber, timestamp, extrinsicHash, amount, fee} = t

        let from = getAccount(accounts, t.from)
        if (from.balance == 0n) ctx.log.warn(`Account ${t.from} is going to have negative balance`);
        from.balance -= t.amount
        from.balance -= t.fee || 0n
        let to = getAccount(accounts, t.to)
        to.balance -= t.amount

        transfers.push(new Transfer({
            id,
            blockNumber,
            timestamp,
            extrinsicHash,
            from,
            to,
            amount,
            fee
        }))
    }
    await getContractEntity(ctx);
    await ctx.store.save(Array.from(accounts.values()))
    await ctx.store.insert(transfers)
})


interface TransferEvent {
    id: string
    blockNumber: number
    timestamp: Date
    extrinsicHash?: string
    from: string
    to: string
    amount: bigint
    fee?: bigint
}


function getTransfers(ctx: Ctx): TransferEvent[] {
    let transfers: TransferEvent[] = []
    for (let block of ctx.blocks) {
        for (let item of block.items) {
            if (item.name == "Balances.Transfer") {
                let e = new BalancesTransferEvent(ctx, item.event)
                let rec: {from: Uint8Array, to: Uint8Array, amount: bigint}
                if (e.isV5) {
                    let [from, to, amount] = e.asV5
                    rec = { from, to, amount}
                } else {
                    throw new Error('Unsupported spec')
                }
                
                transfers.push({
                    id: item.event.id,
                    blockNumber: block.header.height,
                    timestamp: new Date(block.header.timestamp),
                    extrinsicHash: item.event.extrinsic?.hash,
                    from: ss58.codec('substrate').encode(rec.from),
                    to: ss58.codec('substrate').encode(rec.to),
                    amount: rec.amount,
                    fee: item.event.extrinsic?.fee || 0n
                })
            }
        }
    }
    return transfers
}


function getAccount(m: Map<string, Account>, id: string): Account {
    let acc = m.get(id)
    if (acc == null) {
        acc = new Account({id: id, balance: 0n})
        acc.id = id
        m.set(id, acc)
    }
    return acc
}
