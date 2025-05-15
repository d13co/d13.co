---
title: "Sustainability Proposal: Backrun Auctioning on Algorand"
date: 2025-05-06T10:32:45+03:00
draft: true
---

In recent conversations about sustainability and fees on Algorand, most of the focus has been on:

1) raising the minimum fees, or
2) changing the supply model to inflate/deflate dynamically with usage

and to a lesser extent:

3) priority fee ordering - higher fee gets earlier placement in block

The present theorizes about an alternative protocol change in the broader "priority fee" market. It is about a real-time "auction market" for placement _after_ other transactions - also known as backrunning.

Algorand sees significant high-value backrunning activities, like liquidations or arbitrage.

## Transaction ordering: current state of affairs

Default node behavior: (not enforced by consensus)

1. Transactions are placed in blocks in first-in-first-out order, as received by the block proposer.
2. Block proposers receive transactions at different times/order depending on their geographic placement (due to transaction propagation delays and network topology)
3. Future block proposers are unknown

## Backrunning today

"Backrunning" is executing "MEV" transactions immediately _after_ a transaction that creates extractable value. Two primary backrunning examples are liquidations and arbitrage. In liquidations, there is usually an oracle that is updated with the latest price, which allows liquidations to take place. In arbitrage, an inefficient swap enables an arbitrager to move funds between different liquidity pools in order to make a small profit.

Both scenarios are winner-takes-all, and the winner gets to have their transaction executed before their competition. Given the state of affairs of transaction ordering, competitive liquidators and arbitragers are in a race to be first-seen by as many block proposers as possible.

It turns into a numbers- and sometimes brute-force game. They must be fast, and in a competitive enough landscape, they also need to broadcast transactions simultaneously from multiple points, e.g. EU / US East / US West / Asia, in order to increase their odds that proposers "close" to them will see their transaction before competing ones. In the past, there have even been DDOS-level traffic spikes related to liquidations, which were likely a liquidator trying an aggressive (but ineffective) strategy to increase their win rate.

## Proposal: Backrun auctions

This thought experiment suggests that we could devise a mechanism to enable backrunning MEV, while trying to prevent frontrunning MEV by design. It is a protocol recommendation, because a small private subnet of proposers (say, a private JITO-ALGO-like client) would not be effective enough, and it would also not be motivated to share profits with the fee sink.

This mechanism could be implemented as a new transaction field, say `backrun-id`:

- A transaction may have a `backrun-id` field, with a 32-byte value pointing to a "target" transaction's ID.
- A transaction with `backrun-id` can _only_ be executed immediately after the target transaction ID it specifies as its value, or not at all.
- Between the competing `backrun-id` transactions aiming at the same slot, a proposer will pick the one with the highest fee.

### Example run

Let's consider an example of a high-value liquidation. These are usually made possible by price volatility - an increase or decrease in the price of a collateral asset makes a loan "bad", leading to a liquidation opportunity to preserve the health of the lending market.

From the point of view of the future proposer of the block that contains the liquidation, the first relevant thing that happens is that the lending platform's price oracle is updated. This transaction may already be followed by others, such as a USDC payment. With the first-in, first-out rules, the future proposer's view of the future block looks like this:

{{< mermaid >}}
flowchart LR
    A["txn-id: E14..
    F/F UPDATE PRICE ORACLE
    (enables liquidation)"] -->
    O["Some USDC Txn"] -->
    M["_More txns..._"]
{{< /mermaid >}}

A liquidator (eve.algo) has seen the price feed update transaction and composed their liquidation transaction, indicating that it should only be run immediately after the price feed update. The future proposer receives this and inserts it after the price feed update:

{{< mermaid >}}
flowchart LR
    A["txn-id: E14..
    **F/F UPDATE PRICE ORACLE**
    _(enables liquidation)_"] -->
    B["txn-id: EVX..
    backrun-id: E14..
    **fee: 10A**
    sender: eve.algo
    LIQUIDATE"] -->
    O["Some USDC Txn"] -->
    M["_More txns..._"]
{{< /mermaid >}}

Before the block has been assembled and proposed, the block proposer received another liquidation transaction from meve.algo. This one has a higher fee that eve's liquidation, so eve's transaction is discarded and meve's is put in place instead.

{{< mermaid >}}
flowchart LR
    A["txn-id: E14..
    **F/F UPDATE PRICE ORACLE**
    _(enables liquidation)_"] -->
    B["txn-id: JWS..
    backrun-id: E14..
    **fee: 50A**
    sender: meve.algo
    LIQUIDATE"] -->
    O["Some USDC Txn"] -->
    M["_More txns..._"]
{{< /mermaid >}}

When the block proposal timer elapses, the proposer assembles the block and broadcasts it for consensus consideration.

## Intended effects

This is intended to monetize and democratize the backrun half of MEV. Building backrunning into the protocol would help bridge the sustainability gap without introducing the negative user experience side effects of frontrunning & sandwiching.

By enabling preferential placement for arbitrage, liquidations and other backrunning activities, the winning condition in this market would now be paying the highest fee.

Liquidators would still need to act fast - make sure their backrun is propagated to the block proposer in time - but over that threshold, the highest-fee win condition should mean that this market's players will compete with each other to lower their profit margins, to the block proposer's and fee sink's benefits.

- High value slots in blocks are now available to almost everyone
    - Expectation: more liquidators and arbers
- Win requirement: being “fast-enough” (reach proposer before the block is assembled)
    - Expectation: significantly lower bar to compete
- Win condition: highest txn fee wins
    - Expectation: profit margins race to the bottom from competition

## Not so fast

The backrun-id rules as stated above are not the full picture, of course.

There are several concerns to consider around performance, potential for abuse (DDOS) etc.

### Performance

The current first-in, first-out approach to transaction ordering has the following performance benefit: pending/future transactions are evaluated as-received, and if they evaluate successfully, their ledger state transitions are kept until the transaction is either confirmed (included in a block) or expired (last-valid has elapsed without block inclusion.)

Re-ordering transactions after first evaluation will require additional computation. Inserting a backrun transaction after already-evaluated transactions may require the latter to be re-evaluated. A silver lining here is that only a very small percentage of transactions should require re-evaluation: transactions have implicit and explicit references to the resources they are allowed to "touch" - read or write. Having already been evaluated once, a list of such references could be used to quickly varify whether this re-evaluation would be necessary or not - i.e. any transactions after the backrun that have overlapping references with the backrun transaction would require re-evaluation to ensure that the backrun's state transitions does not make them fail.

### 

### Spam for (nearly) free



Some other properties we may want to consider:

- `backrun-id` transactions in the same block must not have overlapping account or application references.
    - This is an attempt to prevent utilizing other (presumably earlier) transactions as an "anchor" to execute a frontrun.
- Relaying nodes should only propagate <u>valid</u> and <u>winning</u> `backrun-id` transactions as another traffic-reduction measure.
    - valid: targetting a transaction in the mempool.
    - winning: with the highest fee seen between competing backrun transactions.
