---
marp: true
theme: uncover
_class: lead
paginate: false
backgroundColor: #fff
backgroundImage: url(./bg_dark.png)
color: #FFFFFF
style: |
  .columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
  .columns-left {
    background: yellow;
  }
  .columns-right {
    background: beige;
  }
  .title {
    color: #FFFFFF
  }
  .subtitle {
    color: #FFB800
  }
  .bulletpoint{
    color: #105EFB
  }
---
<!-- _backgroundImage: url(./bg.png) -->
<span class=title>

## Blockchain indexing by example

</span>

<span class=subtitle>

### Process transfers of $REEF

</span>

### 
### 
### 
### 

---

# Greetings 👋

### Massimo Luraschi

### Developer Advocate @ subsquid.io

* ![w:24 h:24](https://i.imgur.com/wqhrc3N.png) [@RaekwonIII](https://twitter.com/RaekwonIII) 
* ![w:24 h:24](https://i.imgur.com/kH2GXYx.png) RaekwonIII#3962 
* ![w:24 h:24](https://i.imgur.com/92AwE1H.png) [@RaekwonTheChefIII](https://t.me/RaekwonTheChefIII) 
* ![w:24 h:24](https://i.imgur.com/MGAfGvC.png) [RaekwonIII](https://github.com/RaekwonIII) 

---

<span class=subtitle>

### Indexing middleware

</span>

![w:1000](indexing-middleware.png)

<span class=bulletpoint>

##### Ingest on-chain data
##### Data processing framework

</span>

---

<span class=subtitle>

### Modular Architecture

</span>

![w:1000](modular-architecture-new.png)

---

<span class=subtitle>

### Monolith

</span>

**Multiple uses, same ingestion**
**Potential replication**
**Wasted effort, resources**

<span class=subtitle>

### Modular

</span>

**Shared extraction services: Archives**

---
<span class=subtitle>

### Data flow

</span>

![w:1000](archive-data-flow.png)

---
<span class=subtitle>

### Archives benefits

</span>

###### One less thing to **care about**
###### Better storage, **better performance**
###### **Filtering** batching
###### Reduced **network overhead**
###### Modularity ➡️ **future improvements**

---

<span class=subtitle>

### squids 🦑

</span>

![w:1000](squid-data-flow.png)

---
<span class=subtitle>

### Subsquid SDK benefits

</span>

###### **Automated** model generation
###### Automated **ABI ➡️ code**
###### **Code** (TypeScript), not config
###### Strong typigns/**type safety**
###### **Aquarium** - hosted service

---

<!-- _color: #105EFB -->
<span class="subtitle">

### From schema...
</span>

```graphql
type Owner @entity {
  id: ID!
  ownedTokens: [Token!]! @derivedFrom(field: "owner")
  balance: BigInt
}
```

---
<!-- _color: #105EFB -->

<span class="subtitle">

####
#### ...To Models
</span>

```typescript
@Entity_()
export class Owner {
  constructor(props?: Partial<Owner>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @OneToMany_(() => Token, e => e.owner)
  ownedTokens!: Token[]

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  balance!: bigint | undefined | null
}

```

---
<!-- _color: #105EFB -->

<span class="subtitle">

### From ABI...
</span>

```json
[
  // ...
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ...
]
```

---
<!-- _color: #105EFB -->

<span class="subtitle">

### …to TypeScript
</span>

```typescript
export const functions = {
    // ...
    approve: new Func<[to: string, tokenId: ethers.BigNumber], {to: string, tokenId: ethers.BigNumber}, []>(
        abi, '0x095ea7b3'
    ),
    // ...
}

const { _name } = functions.approve.decode(transaction.input);
```

---
<!-- _color: #105EFB -->

<span class="subtitle">

### Aquarium hosting service
</span>

```bash
npm i -g @subsquid/cli@latest
sqd deploy .
```

Visit [app.subsquid.io](https://app.subsquid.io/)

---
<!-- _color: #105EFB -->

<span class="subtitle">

### Resources

</span>

Docs [docs.subsquid.io](https://docs.subsquid.io)
GitHub [github.com/subsquid/](https://github.com/subsquid/)
YouTube [youtube.com/c/subsquid](https://www.youtube.com/channel/@subsquid)
Discord [discord.gg/subsquid](https://discord.gg/subsquid)
Telegram [t.me/HydraDevs](https://t.me/HydraDevs)
Medium [medium.com/subsquid](https://medium.com/subsquid)

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<span class="subtitle">

# Let’s get coding…🦑

</span>

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<span class="subtitle">

## Goal: [$REEF](https://reefscan.com/contract/0x0000000000000000000000000000000001000000) tracker

</span>

1. Setup<!-- .element: class="fragment" -->
2. Review the schema<!-- .element: class="fragment" -->
3. Substrate types<!-- .element: class="fragment" -->
4. Contract ABI<!-- .element: class="fragment" -->
5. Edit logic in Processor<!-- .element: class="fragment" -->
6. Launch database container<!-- .element: class="fragment" -->
7. Create and apply database migration<!-- .element: class="fragment" -->
8. Launch processor and GraphQL server<!-- .element: class="fragment" -->

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Setup

- Requisites: [Node.js](https://nodejs.org/en/download/) (16 or later), [Docker](https://docs.docker.com/get-docker/), [Subsquid CLI](https://docs.subsquid.io/squid-cli/)
- Create new project
- Install dependencies (plus new package for Frontier EVM)

```bash
sqd init reef-transfers
cd reef-transfers && npm i
```
```bash
npm i @subsquid/frontier
```

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Schema

Defined in `schema.graphql` file. 

- Add `balance` field
- Add `Contract` entity 🤔

```graphql
type Account @entity {
  # ...
  balance: BigInt!
}
type Contract @entity {
  id: ID!
  name: String
  symbol: String
  totalSupply: BigInt
}
```

----

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Codegen

* From project's root folder, launch `sqd codegen`
* New files will be created

![w:450](https://i.imgur.com/V3LoX7J.png)

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Substrate types

- Edit `typegen.json` 
- Edit `specVersions` ([Archive Registry repo](https://github.com/subsquid/archive-registry/blob/main/archives.json#L549))
- Specify `Balances.Transfer` in `events`
- Specify `EvmAccounts.EvmAddresses` in `storage`
- From project root folder, launch:

```bash
sqd typegen
```

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Contract ABI

- REEF contract ABI [from reefscan](https://reefscan.com/contract/0x0000000000000000000000000000000001000000)
- Paste into a JSON file (`reef.json`)
- Add a command to `commands.json` (convenience😝)

```bash
"typegen-evm": {
  "description": "Generate data access classes for an ABI file(s) in the ./abi folder",
  "cmd": ["squid-evm-typegen", "./src/abi", {"glob": "./abi/*.json"}, "--multicall"]
},
```
- run command `sqd typegen-evm reef.json` in a terminal

----

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Contract ABI (quirk)

Modify `src/abi/abi.support.ts`:

```typescript
async eth_call<Args extends any[], FieldArgs, Result>(func: Func<Args, FieldArgs, Result>, args: Args): Promise<Result> {
  let data = func.encode(args)
  let result = await this._chain.client.call('evm_call', [
      {to: this.address, data, from: undefined, storageLimit: 0}
  ])
  return func.decodeResult(result)
}
```

----

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Contract handler

- Create a file named `src/contract.ts`
- Define imports
- Add Contract address contract

```typescript
import { Contract as ContractAPI } from "./abi/reef";
import { BigNumber } from "ethers";
import { Ctx } from "./processor";
import { Contract } from "./model";

export const contractAddress = "0x0000000000000000000000000000000001000000";

```

----

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Contract handler

- Add function to create a contract entity

```typescript
export async function createContractEntity(ctx: Ctx): Promise<Contract> {
  const lastBlock = ctx.blocks[ctx.blocks.length -1].header
  const contractAPI = new ContractAPI({...ctx, block: lastBlock}, contractAddress);
  let name = "", symbol = "", totalSupply = BigNumber.from(0);
  try {
    name = await contractAPI.name();
    symbol = await contractAPI.symbol();
    totalSupply = await contractAPI.totalSupply();
  } catch (error) {
    ctx.log.warn(`[API] Error while fetching Contract metadata for address ${contractAddress}`);
    if (error instanceof Error) {
      ctx.log.warn(`${error.message}`);
    }
  }
  return new Contract({
    id: contractAddress,
    name: name,
    symbol: symbol,
    totalSupply: totalSupply.toBigInt(),
  });
}
```

----

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Contract handler

- Add function to handle singleton instance

```typescript
let contractEntity: Contract | undefined;

export async function getContractEntity(ctx: Ctx): Promise<Contract> {
  if (contractEntity == null) {
    contractEntity = await ctx.store.get(Contract, contractAddress);
    if (contractEntity == null) {
      contractEntity = await createContractEntity(ctx);
      await ctx.store.insert(contractEntity);
    }
  }
  return contractEntity;
}

```

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Processor 

- Change archive and chain endpoint

```typescript
const processor = new SubstrateBatchProcessor()
    .setDataSource({
        archive: lookupArchive('reef'),
        chain: "wss://rpc.reefscan.info/ws"
    })
// ...
```

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Processor 

- Add data request for EVM logs

```typescript
const processor = new SubstrateBatchProcessor()
  // ...
  .addEvmLog(contractAddress, {
    filter: [[events.Transfer.topic]],
  });
// ...
```

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Processor 

- Add logic to update balance (rough and inaccurate 😅)

```typescript
for (let t of transfersData) {
    // ...
    let from = getAccount(accounts, t.from)
    if (from.balance == 0n) ctx.log.warn(`Account ${t.from} is going to have negative balance`);
    from.balance -= t.amount
    from.balance -= t.fee || 0n
    let to = getAccount(accounts, t.to)
    to.balance -= t.amount
    // ...
}
```

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Processor 

- Use Substrate types for Reef to decode Event

```typescript
function getTransfers(ctx: Ctx): TransferEvent[] {
  // ...
            if (item.name == "Balances.Transfer") {
                let e = new BalancesTransferEvent(ctx, item.event)
                let rec: {from: Uint8Array, to: Uint8Array, amount: bigint}
                if (e.isV5) {
                    let [from, to, amount] = e.asV5
                    rec = { from, to, amount}
                } else {
                    throw new Error('Unsupported spec')
                }
            }
  // ...
}
```

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Processor 

- Use correct ss58 codec

```typescript
function getTransfers(ctx: Ctx): TransferEvent[] {
  // ...
            if (item.name == "Balances.Transfer") {
                // ...
                transfers.push({
                    // ...
                    from: ss58.codec('substrate').encode(rec.from),
                    to: ss58.codec('substrate').encode(rec.to),
                    // ...
                })
            }
  // ...
}
```

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

# Processor 

- Process EVM log

```typescript
      // ...
      if (item.name == "EVM.Log") {
        const evmLog = getEvmLog(ctx, item.event);
        const { from, to, value } = events.Transfer.decode(evmLog);
        transfers.push({
            id: item.event.id,
            blockNumber: block.header.height,
            timestamp: new Date(block.header.timestamp),
            extrinsicHash: item.event.extrinsic?.hash,
            from: from,
            to: to,
            amount: value.toBigInt(),
            fee: item.event.extrinsic?.fee || 0n,
        });
      }
      // ...
```

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

## Database

* A **squid** need a database to store processed data
* Templates have `docker-compose.yml` file to launch a container
* From project's root folder, launch  `sqd up`

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

## Database migration

- Clean up existing migrations

```bash
sqd migration:clean
```

- Create new migration (will build code)

```bash
sqd migration
```

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

<!-- .slide: class="smol" -->
<!-- .slide: class="left" -->

## Launch the project


- Launch the Processor (will lock the console window)

```bash
sqd process
```

- Launch the GraphQL server (in another console window)

```bash
sqd serve
```

- Open the browser at http://localhost:4350/graphql

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

# Ta-da! 🎉

![](https://media.giphy.com/media/KgZtmd3iI1HoVIBnFf/giphy.gif)

This project is available on [GitHub](https://github.com/RaekwonIII/reef-workshop)

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

# What's next?

### Pick a ~~card~~ contract, any ~~card~~ contract! 🃏🪄

Subsquid SDK allows extreme flexibility.

We ingest blocks, extract data, you decide how to process and index it.

---

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

# Thank you 🦑

Follow the project on GitHub
https://github.com/subsquid/squid

![](https://media.giphy.com/media/SVz8HyYrXdJyE/giphy.gif)

Give us a ⭐, more Alpha coming soon™️

----

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

# Bonus: storage access

To find the claimed EVM address of a Substrate account

```typescript
async function getEvmAddress(ctx: BatchContext<Store, Item>, address: Uint8Array) {
    const storage = new EvmAccountsEvmAddressesStorage(ctx, ctx.blocks[ctx.blocks.length -1].header);

    if (!storage.isExists) return undefined;
    
    if (storage.isV5) {
        return storage.asV5.get(address).then(
            (res: Uint8Array | undefined) => {
                return res ? Buffer.from(res.buffer).toString(): res 
            }
        );
    } else {
        throw new Error("Unknown storage version");
    }
}
```

----

<!-- .slide: data-background="https://i.imgur.com/4P35oA6.png" -->

# Reconcile EVM & Substrate addresses

```typescript
function getTransfers(ctx: Ctx): TransferEvent[] {
  // ...
  if (item.name == "Balances.Transfer") {
      // ...
      transfers.push({
          // ...
        from: await getEvmAddress(ctx, rec.from) || ss58.codec("substrate").encode(rec.from),
        to: await getEvmAddress(ctx, rec.to) || ss58.codec("substrate").encode(rec.from),
          // ...
      })
  }
  // ...
}
```