---
title: "MainNet Archaeology 1: Algorand's Birthday"
slug: mainnet-archaeology-1-algorands-birthday
date: 2026-06-12T14:15:18+00:00
cover:
  image: algo-in-wonderland.jpg
ShowReadingTime: true
ShowToc: true
tags:
  - Algorand Archaeology
  - Algorand's Birthday
---

{{< callout emoji="⚠️" text="_Note: Some sections herein may be disorienting to readers over- or under-sensitive to satire._" >}}

A few crypto-decades ago, the Algorand powers that be decided to celebrate Algorand's Birthday on June 19th. That was the day of the Dutch Auction, through which the ALGO token was first distributed to the broader public, so it was certainly a milestone date. But was it The Birthday?

A few years into MainNet's lifetime, a then-undoxxed crypto anarchist[^me] pointed out that the Genesis block, as well as the first few blocks, ackthually have June 11th timestamps, thus starting the Genesarian schism of the Algorand religion. The Dutchaversarist Foundation was put in an awkward position. It certainly frowned upon the heresy but acknowledging it would only help it spread, so instead it spent years quietly suppressing this rationalist movement built around page 1 of our divine ledger.

But as it turns out, both were wrong, and years later the best guess at an accurate Algorand birthday would spawn yet another rationalist faction, the Duodecimailsts[^duodecim]. They are **pretty sure that Algorand MainNet launched on June 12th, 2019.**

## Genesis Timestamp

Block zero, the "genesis block", is not a block; it is a pre-agreed upon configuration _file_ with which the network launched. It can be queried on [any Algorand node](https://mainnet-api.4160.nodely.dev/genesis). It contains all information required to bootstrap a network, including the distribution of the 10 billion ALGO supply, initial participation key information for the bootstrap nodes, the fee pool address, and so on.

They can also include optional information, like a Genesis timestamp. MainNet's genesis file included such a timestamp: `1560211200`, a.k.a. `Tue, 11 Jun 2019 00:00:00 UTC`. When a genesis timestamp is present, it is treated like a "block zero" timestamp, which restricts possible block one timestamps based on the Algorand block timestamp rules.

## The Algorand block timestamp rules

Algorand block timestamps are recorded as a Unix Timestamp[^unix], and they are selected by the block proposer - within reason. Consensus rules[^bt] govern the "round time" - the difference between successive block timestamps:

- Round time can not be less than zero
- Round time can not be more than 25 seconds

If a proposed block has a timestamp that violates these rules, it will be rejected - so block proposers will pick the closest valid timestamp according to their clock.

**Nodes in temporal distress will propose with a round time of zero if they consider the previous timestamp to be in the future, or with the maximum offset of 25 seconds if their clocks are running way ahead.**

## First MainNet Blocks

The first 6637 blocks on MainNet exhibit a round time of 25 seconds. But this doesn't mean that the protocol was slower back then - after block 6638 we observe the average round time converging around ~4.25 seconds and sustaining that.

So if the first block's timestamp was bound by the genesis timestamp, and we had thousands of consecutive blocks with maximum timestamp, it should follow that all proposing nodes considered their local time to be "way ahead" of the timestamps recorded in the blocks, thus recording 25-second round times. So the June 11 midnight UTC launch time is called into question.

_From an anthropological perspective, it is reasonable to doubt that Algorand inc, based in Boston, would choose to undertake such a significant engineering operation at 8PM on a Monday._

| Round | Timestamp | Round Time | Avg RT (15 rounds) |
|:-:|:-:|:-:|:-:|
| genesis | 1560211200 | | |
| 1 | 1560211225 | 25 | |
| 2 | 1560211250 | 25 | |
| 3 | 1560211275 | 25 | |
| 4 | 1560211300 | 25 | |
| 5 | 1560211325 | 25 | |
| … | … | … | … |
| 6636 | 1560377100 | 25 | 25 |
| 6637 | 1560377125 | 25 | 25 |
| 6638 | 1560377129 | 4 | 23.6875 |
| 6639 | 1560377133 | 4 | 22.375 |
| … | … | … | … |
| 6664 | 1560377239 | 1 | 4.25 |
| 6665 | 1560377243 | 4 | 4.25 |
| 6666 | 1560377243 | 0 | 4.125 |
| 6667 | 1560377243 | 0 | 3.6875 |
| 6668 | 1560377256 | 13 | 4.25 |
| 6669 | 1560377260 | 4 | 4.25 |

[More numbers on Google Sheets](https://docs.google.com/spreadsheets/d/121bzTOIwXmMe6D_pZXnl6gQMjGm7SkWhqBdpop0rvNQ). _As an aside, we can [also see](https://docs.google.com/spreadsheets/d/121bzTOIwXmMe6D_pZXnl6gQMjGm7SkWhqBdpop0rvNQ/edit?gid=886315211#gid=886315211) that at launch some nodes had persistent clock drift, which explains the 15-round-sample aberrations in average round time, but on average timekeeping was fine after block 6638._

## Duodecimalist napkin math

Where does all this leave the actual launch date? Well, since Algorand Has Never Had Downtime™, we will discard the possibility that MainNet started, then stopped, then started again, and instead we will take this reasonable leap of faith:

**Assumption: the average round time exhibited from [block 6638](https://algo.surf/6638) onwards (4.25 seconds) was approximately the average round time leading up to that block.**

To work backwards from that, we anchor "real time" at block 6638 being 2019-06-12 22:05:29 UTC, and pin the actual launch at ~28211 seconds[^math] before that, which leads to Duodecimalist tenet #1:

{{< callout emoji="✍" text="**Algorand MainNet launched at around 2019-06-12 14:15 UTC, give or take a few hours.**" >}}



_This also pleases the anthropologists, as it works out to 10:15 AM Boston time._

## Recognized Duodecimalist Launch Milestones

The Duodecimalists acknowledge the following MainNet launch milestones:

- June 11th: Genesis Timestamp
- June 12th: MainNet Launch Date
- June 15th: [First Transactions](https://algo.surf/transaction/7MK6WLKFBPC323ATSEKNEKUTQZ23TCCM75SJNSFAHEM65GYJ5ANQ)
- June 19th: Public Opening via Dutch Auction

## Revelation. Et tu? Vote!

Faced with the Blinding Light of Duodecimalist Revelation, reformed Genesarians must take the painful journey of acknowledging their former folly. Surely Algorand never has, and never will, stall - and surely Algorand Inc would not turn on MainNet lights at 8PM on a Monday and then go home... What _were_ we thinking!

Are you convinced? Let it be known by voting with your wallet. Do not worry, it is not expensive. It is on Algorand.

<link href="style.css" rel="stylesheet" />

**What do you consider Algorand's Birthday? Vote on-chain with your wallet by selecting your choice:**

<div id="poll-vote">
  <div class="poll-options">
    <button data-code="11" onclick="vote('11')"><span class="poll-date">June 11th</span><span class="poll-faction">Genesarian</span></button>
    <button data-code="12" onclick="vote('12')"><span class="poll-date">June 12th</span><span class="poll-faction">Duodecimalist</span></button>
    <button data-code="15" onclick="vote('15')"><span class="poll-date">June 15th</span><span class="poll-faction">First Transactionistian</span></button>
    <button data-code="19" onclick="vote('19')"><span class="poll-date">June 19th</span><span class="poll-faction">Dutchaversarist</span></button>
    <button data-code="A" onclick="vote('A')"><span class="poll-date">Abstain</span><span class="poll-faction">Didn't read, Don't care</span></button>
  </div>
  <div id="poll-action"></div>
</div>

**Results**

<div id="poll-results">
  (Loading)
</div>

<div class="poll-voters-head">
  <strong>Recent votes</strong>
  <a id="poll-export" href="#" onclick="exportCSV(event)">Export CSV</a>
</div>

<div id="poll-voters">
  (Loading)
</div>

<script src="https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs@04f46c6a0708418cb7b96fc563eacae0fbf77674/qrcode.min.js"></script>
<script src="vote.js"></script>

## Parting Thoughts and Disclaimers

I had fun writing this. I'm trying to improve my writing, but I can't seem to stop trying to thread the humour needle and stabbing my thumb in the process.

Yes, I do believe MainNet launched June 12th.

Beyond that, I do not take it that seriously, and the conspiracy and religious references are meant to be tongue in cheek. Algorand is not a religion, I am not poking fun at religion in general, nor your religion in particular.

And clearly: these views are personal and not representing my employer, whoever that may be at this time in space.

{{< callout emoji="⚠️" text="Read the above before reaching out to the [Complaint Department](https://algo.surf/account/COMPLAINTDEPARTMENTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJDV26LQ)" >}}

[^me]: Me.
[^duodecim]: Duodecim is the Latin word for Twelve.
[^unix]: Number of non-leap seconds elapsed since Jan 1, 1970. [Learn more](https://en.wikipedia.org/wiki/Unix_time)
[^bt]: Code: [Bookkeeping rules](https://github.com/algorand/go-algorand/blob/ea67b3f8816b238ba096d003587d1ff091f8ea24/data/bookkeeping/block.go#L818) - Spec: [MaxTimestampIncrement](https://specs.algorand.co/ledger/ledger-parameters?highlight=MaxTimestampIncrement#block)
[^math]: Duration of 6638 rounds at 4.25 seconds each.
