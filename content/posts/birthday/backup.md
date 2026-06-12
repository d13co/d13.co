---
title: "MainNet Archaeology 1: Algorand's Birthday"
slug: birthday
date: 2026-06-12T14:15:18+00:00
---

_Note: Some sections herein may be disorienting to readers unable to parse satire._

A few crypto-decades ago, the Algorand powers that be decided to celebrate Algorand's Birthday on June 19th. That was the day of the Dutch Auction, through which the ALGO token was first distributed to the broader public, so it was certainly a milestone date. But was it The Birthday?

A few years into MainNet's lifetime, an undoxxed crypto anarchist pointed out that the Genesis block, as well as the first few blocks, ackthually have June 11th timestamps, thus starting the Genesarian schism of the Algorand religion. The Dutchaversarist Foundation was put in an awkward position. It certainly frowned upon the heresy but acknowledging it would only help it spread, so instead it spent years quietly suppressing this rationalist movement built around page 1 of our divine ledger.

But as it turns out, both were wrong, and years later the best guess at an accurate Algorand birthday would spawn yet another rationalist faction, the duodecimailsts[^duodecim]. They are **pretty sure that Algorand MainNet launched on June 12th, 2019.**

## Genesis Timestamp

Block zero, the "genesis block", is not a block; it is a pre-agreed upon configuration _file_ with which the network launched. It can be queried on [any algorand node](https://mainnet-api.4160.nodely.dev/genesis). It contains all information required to bootstrap a network, including the distribution of the 10 billion ALGO supply, initial participation key information for the bootstrap nodes, the fee pool address, and so on.

They can also include optional information, like a Genesis timestamp. MainNet's genesis file included such a timestamp: `1560211200`, a.k.a. `Tue, 11 Jun 2019 00:00:00 UTC`. When a genesis timestamp is present, it is treated like a "block zero" timestamp, which restricts possible block one timestamps based on the Algorand block timestamp rules.

## The Algorand block timestamp rules

Algorand block timestamps are recorded as a Unix Timestamp[^unix], and they are selected by the block proposer - within reason. Consensus rules[^bt] govern the "round time" - the difference between successive block timestamps:

- Round time can not be less than zero
- Round time can not be more than 25 seconds

If a proposed block has a timestamp that violates these rules, it will be rejected - so block proposers will pick the closest valid timestamp according to their clock.

**Nodes in temporal distress will propose with a round time of zero if they consider the previous timestamp to be in the future, or with the maximum offset of 25 seconds if their clocks are running way ahead.**

## First MainNet Blocks

The first 6637 blocks on MainNet exhibit a round time of 25 seconds. But this doesn't mean that the protocol was slower back then - after block 6638 we observe the average round time converging around ~4.25 seconds and sustaining that.

So if the first block's timestamp was bound by the genesis timestamp, and we had thousands of consecutive blocks with maximum timestmap, we are forced to conclude that all proposing nodes considered their local time to be "way ahead" of the timestamps recorded in the blocks, so the June 11 midnight UTC launch time is called into question.

_From an anthropological perspective, it is reasonable to doubt that Algorand inc, based in Boston, would choose to undertake such a significant engineering operation at 8PM on a Monday._

## Duodecimalist napkin math

Where does all this leave the actual launch date? Well, since Algorand Has Never Had Downtime™, we will discard the possibility that MainNet started, then stopped, then started again, and instead we will take this reasonable leap of faith:

**Assumption: the average round time exhibited from [block 6638](https://algo.surf/6638) onwards (4.25 seconds) was approximately the average round time leading up to that block.**

Working backwards from that, we anchor "real time" at block 6638 being 2019-06-12 22:05:29 UTC, and pin the actual launch at ~28211 seconds[^math] before that, which leads to Duodecimalist tennet #1:

**Algorand MainNet launched at around 2019-06-12 14:15 UTC, give or take a few hours.**

_This also pleases the anthopologists, as it works out to 10:15 AM Boston time._

## Official Duodecimalist Algorand Launch Milestones

The Duodecimalists acknowledge the following MainNet launch milestones:

- June 11th: Genesis Timestamp
- June 12th: MainNet Launch Date
- June 15th: First Transctions
- June 19th: Public Opening via Dutch Auction

Until further evidence disproves us, this is our canon.

## Revelation. Et tu?

Faced with the Blinding Light of Duodecimalist Revelation, reformed Genesarians must take the painful journey of acknowledging the folly of their former faith. Surely Algorand never has, and never will, stall - and surely Algorand Inc would not turn on MainNet lights at 8PM on a Monday and then go home.

And you? Are you convinced? Let your stance be known by voting with your wallet. Do not worry, it is not expensive. It is Algorand.

TODO: 

[^duodecim]: Duodecim is the Latin word for Twelve.
[^unix]: Number of non-leap seconds elapsed since Jan 1, 1970. [Learn more](https://en.wikipedia.org/wiki/Unix_time)
[^bt]: Code: [Bookkeeping rules](https://github.com/algorand/go-algorand/blob/ea67b3f8816b238ba096d003587d1ff091f8ea24/data/bookkeeping/block.go#L818) <br/> Spec: [MaxTimestampIncrement](https://specs.algorand.co/ledger/ledger-parameters?highlight=MaxTimestampIncrement#block)
[^math]: Duration of 6638 rounds at 4.25 seconds each.
