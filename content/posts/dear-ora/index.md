---
title: "Dear Ora: An open letter to Ora miners"
date: 2024-11-14T12:02:10+01:00
draft: true
---

**TL;DR: You can lighten the load of Ora on the ecosystem infrastructure by making small changes: mine with maximum fees (0.02) and minimize note sizes.**

Let me preface this by stating my own opinion about Ora, in case this helps set the tone. I like Ora. I use Ora. One could argue that I am a kind of Godfather to it, having sniped the 1284444444 asset ID that we all like.

In light of the first Ora halving, I took a look at Ora statistics and mining practices. The objective is to make a recommendation on Ora mining practices to reduce Ora's negative externalities on Algorand infrastructure, while at the same time appreciating the positive externalities.

## 1. TPS records and Transaction Sizes

Ora community members on X and Discord have been discussing setting new TPS records with Ora. This is not possible.

Ora transaction sizes usually hover between 380 - 420 bytes, assuming no notes are used. A block on Algorand has a 5MB size limit for transactions, so taking an optimistic 400 bytes per transaction and 2.9 second block times, we get a theoretical maximum of ~4519 TPS (5 * 1024 * 1024 / 400 / 2.9).

This has been beat several times: 

- outer ALGO payment transactions (~194 bytes) at [5K TPS sustained](https://x.com/d13_co/status/1789451966956880135)
- outer USDC asset transfers at 5.7K TPS sustained (current chainspect record - still owe you a writeup for that)
- blocks with [58888](https://algo.surf/block/25836244) and [51895](https://algo.surf/block/25808869) transactions, etc.

Breaking these records would likely involve either small transactions (under 200 bytes) or heavy use of inner transactions.

## 2. Externalities

> An externality is a cost or benefit that is caused by one party but financially incurred or received by another. Externalities can be negative or positive. A negative externality is the indirect imposition of a cost by one party onto another. A positive externality, on the other hand, is when one party receives an indirect benefit as a result of actions taken by another.

Ora is drenched in externalities, positive and negative.

Ora's primary positive externality is funding the fee sink. At the time of writing, 2,854,139.97 ALGO has been sent to the fee sink via Ora mining.

Funding the fee sink is important: when ALGO supply is 100% circulating, the fee sink will be the primary (or only?) source of funding for network security, ecosystem support, etc. The upcoming staking rewards (block production incentives) will also be funded by the fee sink.

Another externality is the mining transactions themselves. This is mixed, with the positive being boosting TPS and overall transactions on Algorand, but another is the cost of the Ora transactions on the ecosystem infrastructure.

At the time of writing, Ora stands at an impressive 436,327,140 lifetime transactions. Algorand Mainnet has 2,483,096,263 total transactions, meaning Ora accounts for 17.57% of all Algorand transactions.

_Note: the "time of writing" spanned a few days, so the numbers are not going to be 100% consistent to a single point in time._

A lot of nodes on Algorand are "light", in that they keep the latest 1320 blocks and are "unburdened by what has been", i.e. the entire history of the blockchain.

However, the entire blockchain history is still necessary to store, mostly in two forms:

- Archival algod nodes: these nodes store every Algorand block since genesis. You can not trustlessly validate the history of the chain without them, or feed a custom indexer via conduit.
- Indexers: general purpose databases that link accounts, assets, and applications to specific transactions. Used by explorers and for lookups that algod is not optimized for, such as "which accounts hold asset X and what is their balance".

At 44+ million blocks and 2.4+ billion transactions, both are hefty to store already.

My mainnet archival algod node:

Total ledger size: 1953571409920 bytes (1.77 TB), of which 1887219470336 bytes (1.71 TB) is the block ledger (ledger.block.sqlite)

Indexers are heavier still. My mainnet indexer data directory is currently sweating at 3310307028 bytes (3.1TB). The vast majority of this weight is in the following two tables, which store transactions (2.2 TB) and relations between accounts and transactions (827 GB), totalling 3074 GB (3 TB)

```
                 table_name                | table_size | indexes_size | total_size
-------------------------------------------+------------+--------------+------------
 "public"."txn"                            | 1989 GB    | 258 GB       | 2247 GB
 "public"."txn_participation"              | 318 GB     | 509 GB       | 827 GB
```

Transactions do not all "weigh" the same, but a back of the envelope division gives us:

- Average block ledger space per txn: ~760.03 bytes
- Average indexer space per txn: ~1329.26 bytes (txn & txn_participation tables)

To estimate Ora algod storage, I will provide two estimations - one with the 400 byte average Ora transaction size (which will be an undercount as it does not include other overheads for storage, and is not reflective of the actual average Ora transaction size) and one with the average transaction size of 760 bytes (which may be an overestimate)

- 436327140 * 400 = 162.54 GB
- 436327140 * 760 = 308.83 GB

For indexers we will use the average 1329.26 byte size for lack of a better metric:

- 436327140 * 1329.26 = 540.16 GB

## 3. Ora best (?) mining practices

Everything I've seen from the Ora community makes me believe that they are absolutely aligned with the success of Algorand and our broader ecosystem.

It is in this spirit that I will humbly suggest that the best practice for Ora mining should also take into account the overhead incurred on archival nodes and indexers.

In practice this would mean:

- When possible, opt for mining with the maximum transaction fees.
- When possible, minimize the note field size.

### Fewer transactions, same outcomes

From a miner point of view, 10 transactions with 0.002 fee are equivalent to 1 transaction with 0.02 fee. The same work (Ora effort) is being produced, the same fees are paid into the sink.

The major difference is that archivals and indexers need to store 10 transactions instead of 1, and over hundreds of millions of transactions, this overhead adds up to something significant.

I pulled some statistics for the lifetime average fee paid by Ora miners:

- Ora transaction count: 436350671
- Ora transactions' average fee: 0.006540 ALGO
- Ora total fees: 2,854,139.97 ALGO

If you embrace mining closer to 0.02 than 0.002, the same work product will be possible with a lot less overhead on the infrastructure.

### "No notes"

Ideally Ora miners would not include notes in their transactions. In certain cases, miners are settings notes to hunders of characters. This is not beneficial to anyone.

If you are a miner, please check if your mining transactions are currently including large notes.

Make sure you are checking the base64 or hex representation of the note. This seemingly short note is actually taking up 411 bytes:

![](note-num.png) ![](note-base64.png)

## Wrapping Up

I don't want to wax on for longer than necessary.

You can keep doing what you are doing, but with ~10x less impact to the ecosystem infrastructure by following the two points mentioned above: fewer overall transactions, and smaller individual transaction sizes.

The ledger is there to be filled, but growing it more/faster than necessary incurs additional costs on the infrastructure of our ecosystem. If you are aligned with the success of our ecosystem, and in particular with our infrastructure providers, consider changing your mining practices to reflect that.

Slower growth in ledger space (archival algod) means the ecosystem as a whole can keep costs lower for longer. Free indexers being available to everyone means that developer and project onboarding is easier.

## Subsigners

This is the gist of this open letter:

> Dear Ora Miners,
> 
> Please minimize the load of Ora on the ecosystem infrastructure by transaction count and size. Consider mining with maximum fees (0.02 ALGO) and without large notes in your transaction.

The following have signed this message:

<div className="signers">
(Loading)
</div>

If you want to sign this message, you can do so on-chain.

<div class="">
</div>
