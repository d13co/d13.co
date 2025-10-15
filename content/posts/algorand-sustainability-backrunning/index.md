---
title: "Algorand Sustainability Proposal: Backrunning MEV"
slug: algorand-sustainability-proposal-backrunning-mev
date: 2025-10-14T17:32:45+03:00
ShowReadingTime: true
ShowToc: true
TocOpen: true
cover:
  image: backrun-cover.png
---

## Preface

In recent conversations about sustainability and fees on Algorand, most of the focus has been on:

1) raising the minimum fees, or
2) changing the supply model to inflate/deflate dynamically with usage

and to a lesser extent:

3) priority fee ordering - higher fee gets earlier placement in block

I propose an alternative protocol change in the broader "priority fee" market. This is a personal proposal, which I have also made internally at the Algorand Foundation as part of the sustainability / King Safety project. The views presented here are my own.

My proposal concerns a real-time "auction market" for placement _after_ other transactions - also known as backrunning. Algorand sees significant high-value backrunning activities, like liquidations or arbitrage, and a protocol-native market like this should, through market dynamics, redirect most of those activities' profits to the block proposers and fee sink.

## Transaction ordering primer: current state of affairs

This is the current node behavior.

1. Transactions are placed in blocks in first-in-first-out order, as received by the block proposer.
2. Block proposers receive transactions at different times/order depending on their geographic & network placement (due to transaction propagation delays and network topology)
3. Future block proposers are unknown

Note: this is the default behavior of algod, but it is not enforced by consensus.

## Backrunning today

> What is backrunning in crypto?
>
> Whereas frontrunning rearranges transactions so the person who finds it can extract profits (or execute other smart contract calls to their benefit) before someone's transaction executes, backrunning places the transaction after that person's transaction
>
>[MEX explained, a16zcrypto](https://a16zcrypto.com/posts/article/mev-explained/)

"Backrunning" is executing value-extracting transactions immediately _after_ a transaction that creates extractable value. Two primary backrunning examples are liquidations and arbitrage. In liquidations, there is usually an oracle that is updated with the latest price, which allows liquidations to take place. In arbitrage, an inefficient swap enables an arbitrager to move funds between different liquidity pools in order to make a profit. 

Both scenarios are winner-takes-all, where the winner gets to have their transaction executed before their competition. Given the state of affairs of transaction ordering, competitive liquidators and arbitragers are in a race to be first-seen by as many block proposers as possible.

This turns into a numbers- and sometimes brute-force game. They must be fast, and in a competitive enough landscape, they also need to broadcast transactions simultaneously from multiple points, e.g. EU / US East / US West / Asia, in order to increase their odds that proposers "close" to them will see their transaction before competing ones. In the past, there have even been DDOS-level traffic spikes related to liquidations, which were likely a liquidator trying an aggressive (but ineffective) strategy to increase their win rate.

## Proposal: Backrun auctions

I believe we can devise a mechanism to enable backrunning MEV, while trying to prevent frontrunning & sandwiching by design.

The objective of this proposal is to increase fee sink and block proposer revenue, in order to make the Algorand protocol more sustainable in the long run.

This mechanism could be implemented as a new transaction field, say `backrun-id`:

- A transaction may have a `backrun-id` field, with a 32-byte value pointing to a "target" transaction's ID.
- A transaction with `backrun-id` can _only_ be executed immediately after the target transaction ID it specifies as its value, or not at all.
- Between the competing `backrun-id` transactions aiming at the same slot, a proposer will pick the one with the highest fee.

Other restrictions will likely have to apply, like a maximum transaction lifetime for backruns (DDOS prevention), or preventing reference overlap between backruns (optimistic frontrun prevention), etc.

### Example run

Let's consider an example of a high-value liquidation. These are usually made possible by price volatility - an increase or decrease in the price of a collateral asset makes a loan "bad", leading to a liquidation opportunity to preserve the health of the lending market.

From the point of view of the future proposer of the block that contains the liquidation, the first relevant thing that happens is that the lending platform's price oracle is updated. This transaction may already be followed by others, such as an unrelated USDC payment. With the first-in, first-out rules, the future block looks like this:

{{< mermaid >}}
flowchart LR
    A["txn-id: E14..
    UPDATE PRICE ORACLE
    (enables liquidation)"] -->
    O["Some USDC Txn"] -->
    M["More txns..."]
{{< /mermaid >}}

A liquidator (eve.algo) has seen the price feed update transaction and composed their liquidation transaction, indicating that it should only be run immediately after the price feed update. The future proposer receives this and inserts it after the price feed update:

{{< mermaid >}}
flowchart LR
    A["txn-id: E14..
    UPDATE PRICE ORACLE
    (enables liquidation)"] -->
    B["txn-id: EVX..
    backrun-id: E14..
    sender: eve.algo
    **fee: 10A**
    LIQUIDATE"] -->
    O["Some USDC Txn"] -->
    M["More txns..."]
{{< /mermaid >}}

Before the block has been assembled and proposed, the block proposer received another liquidation transaction from steve.algo. This one has a higher fee that eve's liquidation, so eve's transaction is discarded and steve's is put in place instead.

{{< mermaid >}}
flowchart LR
    A["txn-id: E14..
    UPDATE PRICE ORACLE
    (enables liquidation)"] -->
    B["txn-id: JWS..
    backrun-id: E14..
    sender: steve.algo
    **fee: 50A**
    LIQUIDATE"] -->
    O["Some USDC Txn"] -->
    M["More txns..."]
{{< /mermaid >}}

When the block proposal timer elapses, the proposer assembles the block and broadcasts it for consensus consideration.


## Intended Effects

This mechanism aims to **monetize and democratize** the backrun half of MEV. Building backrunning into the protocol could help bridge the sustainability gap without introducing the negative user experience side effects of frontrunning or sandwiching.

By enabling preferential placement for arbitrage, liquidations, and other backrunning activities, the winning condition in this market becomes paying the highest fee.

Liquidators would still need to act quickly - ensuring their backrun reaches the proposer in time - but beyond that, the "highest-fee-wins” condition should push competitors to lower their profit margins, benefiting the proposer and the fee sink.

* **High-value slots** in blocks become accessible to almost anyone

  * Expectation: more liquidators and arbitragers
* **Win requirement:** be "fast enough” (reach the proposer before block assembly)

  * Expectation: significantly lower barrier to compete
* **Win condition:** highest transaction fee wins

  * Expectation: given sufficient competition, backrun fees for liquidations/arbitrage will approach the value of the underlying opportunity
  * Expectation: majority of profit redirected to block proposers and the fee sink

---

## Why Not a Private Fee Market?

This is a protocol-level recommendation because a private side market would not be effective until it had significant uptake from node runners - and even then, it would have little incentive to share profits with the fee sink.

The unpredictability of future block proposers also works in favor of a protocol-level mechanism. Even if competing fee side markets achieve significant market share, arbitragers and liquidators would still likely use the protocol mechanism as well. Since they cannot predict whether a side-market participant will propose the next block, they would participate in both markets to maximize their profits.

---

## Yes, But…

The `backrun-id` rules as outlined here are not the full picture - there are several concerns to address around performance, potential abuse (DDoS), and frontrunning.

*Disclaimer: I am not a protocol developer - think of this section as drawn on a napkin with crayons.*

### Performance

The current FIFO approach has a performance benefit: pending transactions are evaluated as they are received, and if they evaluate successfully, their ledger state transitions are cached until the transaction is either confirmed (included in a block) or expired (if `last-valid` elapses without inclusion).

Reordering transactions after initial evaluation would require additional computation. Inserting a backrun transaction before already-evaluated ones may require those later transactions to be re-evaluated.

The silver lining is that only a small percentage of transactions should require re-evaluation, and it should be relatively cheap to determine which ones do, because:

> Transactions have implicit and explicit [references](https://dev.algorand.co/concepts/smart-contracts/resource-usage/#different-ways-to-provide-references) to the resources they are allowed to "touch” (read, write, interact with).

Having already been evaluated once, a list of these references could be cached. Any transactions after the backrun that have overlapping references would require re-evaluation to ensure the backrun’s state transitions don’t cause them to fail. It would make sense for this recalculation to occur once, at block assembly time.

### Potential for Abuse & DDoS

Currently, relaying nodes only propagate transactions that successfully evaluate against the current ledger state. As a side effect, most propagated transactions end up being included in blocks and paying their fees.

The winner-takes-all nature of the backrun proposal introduces a scenario where many propagated transactions may never execute - and thus never pay fees - because a higher-fee backrun wins.

We could add propagation optimizations:

* Relaying nodes should only propagate <u>valid</u> and <u>winning</u> `backrun-id` transactions:

  * **Valid:** targets a transaction in the mempool
  * **Winning:** currently has the highest fee among competing backruns

However, the "pay-once” model still leaves this open to abuse: an adversary could flood the network with valid backruns with increasing fees, each of which would be propagated. Sender restrictions would not meaningfully help, as such an attack can be cheaply executed with Sybils.

**It’s likely that a system like this should require a minimum fee to be paid by backrunning transactions regardless of execution.** This would impose the same propagation cost as any other transaction.

### Optimistic Frontrunning

During a friendly red-teaming of this concept, [nullun](https://x.com/nullun) pointed out that an unbounded backrun system could still be used to execute a frontrun or sandwich.

A frontrunner could select an "early” transaction - the earliest they’ve seen that has not yet been included - and attempt an optimistic frontrun of their target transaction by backrunning from that earlier one. The backrun mechanism would then be used to execute the backrun portion of the sandwich.

We could mitigate this by adding a **mutual exclusion restriction** between backrun transactions in the same block:

* `backrun-id` transactions in the same block must not have overlapping account or application references.

This "isolation” would prevent multiple backruns interacting with the same application or account from coexisting in a block, making optimistic frontrunning impossible.

This would, however, add complexity to the backrun transaction selection algorithm: the protocol would now need to select a subset of backrun transactions that maximizes total fees while respecting the isolation rule.

---

## Afterword

MEV is a dirty word - but it can also be a major source of fee revenue for blockchains.

This proposal aims to **thread the needle**: to capitalize on a subset of MEV that I believe is non-harmful and is happening anyway, just via brute force today.

Would you like to see this implemented on Algorand? Do you think it would work? Can you think of ways it might make your on-chain experience worse? I’d love to hear your thoughts [on X](https://x.com/d13_co) or [on Discord](https://discord.gg/algorand).

