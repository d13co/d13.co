---
title: "Thoughts on \"a\" musing on the pond: Dynamic supply for Algorand"
date: 2024-01-31T00:13:37+00:00
slug: musing-on-the-pond-dynamic-supply
cover:
  image: dall-e-princess-frog.png
ShowReadingTime: true
ShowToc: true
TocOpen: true
tags:
- "Algorand protocol"
- "Inflation"
---

**The ["Musings on the pond"](https://medium.com/@fishermanalgo/musings-on-the-pond-f1c6f6deeb72) article lays out a thought-provoking proposal for a deep intervention in Algorand's economics.** If you have not read it, it is well worth putting it at the top of your reading list and getting to it soon - even now, in fact: if you have the time, go [read that first](https://medium.com/@fishermanalgo/musings-on-the-pond-f1c6f6deeb72).

Among the proposed interventions is **a set of changes to the minimum transaction fee, block rewards and fee burns that would alter the fixed nature of the total supply of Algorand.** The present article discusses these changes.

## Proposal: Per-block fee burn, issuance and dynamic supply

The part of the overall proposal we will examine is laid out in three bullet points:

> - Adjust transaction fees up from .001 -> .01
> - Uncap Algorand’s supply — Add programmatic issuance of ALGO per block for validators of .25 ALGO per block (mining)
> - Add Burn mechanic per transaction — Set dynamically at 50% of the txn fee (.005 without congestion), a block with 51 txns or more would be net deflationary (50 txns *.005 ALGO = .25 ALGO burnt = new issuance)
> 
> All of these parameters could be adjusted over-time through governance

_Search "A Holistic Proposal for Change" in the musings article._

_John: sorry I cut up your holistic proposal (this is only a part of it.)_

{{< details "The following example is also given:" >}}
Example Block

200 txns = 2 ALGO in total txn fees (.01*200)

50% is burned = 1 ALGO

The 1 ALGO remaining is split between the fee sink (.5) and validator (.5)

.25 ALGO is issued to the validator from the protocol

The validator would also get an incentive from the Node Incentives program (ranging up to 35 ALGO in the first year)

The validator would end up making ~35.75 ALGO from processing a single block in the first year with 200 txns

The fee sink would generate .5 ALGO from the block

The protocol would issue .25 new ALGO and burn 1 ALGO making total supply net deflationary (-.75 ALGO)
{{</ details >}}

## How even? "Protocol changes"

The Algorand protocol, like most other blockchain protocols, can be changed - through consensus. This section briefly* describes the process.

_* And possibly inaccurately - this is all from memory._

There are multiple reasons to want protocol upgrades: Shorter or dynamic round times, upgrading the Algorand Virtual Machine (AVM) to new versions (e.g. supporting more smart contract opcodes), new protocol-level features (e.g. State Proofs) etc. Algorand is constantly improving, and the ability to upgrade the protocol is core to this evolution.

The protocol defines many parameters that can be tweaked, such as the minimum transaction fee, minimum balances for certain things etc. A protocol upgrade could, for instance, be just "lower the minimum transaction fee to 900 microAlgo".

But the more impactful upgrades, like the ones listed at the top, would require a substantially-improved/new version of algod to support them.

The process for all protocol upgrades, big and small, usually goes like this:

- Develop new code, publish on Github, cut and test a release.
- An initial deployment is done to `betanet`.
  - Betanet's raison d'être is to test new protocol versions without impacting `testnet`, which should be a stable network for developers to test on. It is the "move fast and break things" network.
- If the `betanet` deployment works out, the release is approved for deployments on `testnet` and `mainnet`, pending confirmation by each network's consensus layer.

### Accepting protocol changes

The actual protocol governance happens between nodes participating in consensus.

When a new protocol version is ready to release on one of the public networks, this is advertised to participating nodes in the form of a vote.

![](dall-e-voting.png)

This vote requires a supermajority (of 90%? I believe) to pass. The voters are the nodes participating in consensus, and their voting power is the ALGO they have as online stake. 1 ALGO = 1 vote. If 90% of the ALGO participating in consensus decides to go for the next version of the protocol, then it is adopted network-wide.

The vote format is simple: upgrade to the latest version of algod to support the proposal, or abstain from upgrading to reject it. If the required supermajority is not met by the end of the voting period, the protocol upgrade is rejected.

_One more disclaimer: the above is from memory, do not base your dissertation on the exact details._

### ThE fOuNdAtIoN cAn ChAnGe ThE sUpPLy AnD dUmP oN YoU

An entertaining bit of FUD from the past went something like this:

> "The Algorand foundation can just change the total supply and dump on your head"

This was based on an honest response by Fabrice in the Algorand forums early on (2021?), which went something like: "Algorand is upgradable software, so yes, technically it is possible to change that parameter by changing how the protocol works."

Reducing that statement to "they can just do it" is a masterful distillation of truth into single-malt bullshit:

1) They can't "just" do it, they would have to at least get buyin from the super majority of online stake, and -
2) The actual community that isn't participating in consensus. The code is open after all, and a change like this would be widely discussed, and -
3) This was presented as some unique Algorand Achilles heel - but basically all blockchains can do this! Ethereum switched their entire consensus model from PoW to PoS. Even Bitcoin introduces new protocol level features - e.g. taproot was introduced in 2021.

## Won't someone think of the flation!

![](dall-e-confudius.png)

> The fixed supply is **canon**
>
> Dare you speak of changing it?
>
> Think of the inflation
>
> \- Confudius, 13 B.C.E

Finally getting to the meat of the article: **let's examine a current- and bear-case for Algorand's future, and see what kind of inflation this change would result in.**

Recall the two factors pushing and pulling the total supply under this proposed model:

- Programmatic issuance of ALGO per block for validators:
  - + 0.25 ALGO per block
- Burn mechanic per transaction
  - 50% of the txn fee (.005 without congestion)

The inflationary/deflationary threshold would be 50 transactions **per block.**

> a block with 51 txns or more would be net deflationary (50 txns *.005 ALGO = .25 ALGO burnt = new issuance)


### If today was groundhog day...

What would this look like if "today" was played out for an entire year under the new model?

Let us look at this 24 hour range of blocks:

```text
Block: 35659897
Time: 01/29/2024 09:42:32 PM
Transaction counter: 1433848232

Block: 35690000
Time: 01/30/2024 09:42:32 PM
Transaction counter: 1436876218

Block diff: 30,103
Txn diff: 3,027,986
Average block time: 2.87 s 

Average TPS: 35.04613425925926
Average TPB: 100.58240532407409 (per 2.87s block)
```

Wait, that's -

```text
Per block:
Fees: 1.005824053240741 (@ 0.01 minimum fee)

Total Supply:
Issued: +0.25 
Burned: -0.5029120266203705 (half the txn fees)

Net supply change: -0.2529120266203705
```

\- already deflationary 😲.

📢 **With 2.87 second round time, the break-even TPS is 17.42** 👈

So if "today" played out under the new protocol, it would result in **deflation** of 0.2529 ALGO per block.

Is that a lot? What if we did an entire year under this exact proposed model, with these exact values for TPS, block time, etc?

We had 30,103 blocks produced today, so the total supplywould be reduced by 7613.05 ALGO and the yearly supply reduction (in this ground-hog day/year at the pond) would be 2,778,763.25 ALGO.

I wouldn't say no to getting a tip like that in my wallet, but what does it look like in context? 

The total supply of 10,000,000,000.00 ALGO would become 9,997,221,236.75 ALGO.

**The yearly inflation at ~35 TPS average would be _negative_ 0.0278%.**

Do note that:

- "today" (2024-01-30) was not cherry-picked, it is the day of the pondening, when the musings article was released.
- 0.0278% is a very small number
- 17.42 TPS is a very attainable number
- on this arbitrary day we were at slightly over 2x the break-even 17.42 TPS

### But what if we have a very bad TPS year

What kind of inflation would this model result in, if we had record-low TPS?

Let's go very, very, bear-in-the-dumps-low: 5 TPS.

All other figures being the same, we get:

```
Per block:
Txns: 14.35
Fees: 0.1435 (@ 0.01 minimum fee)

Total Supply:
Issued: 0.25
Burned: 0.07175 (half the txn fees)

Net supply change (block): 0.178250
Net supply change (day): 5,365.8597
Net supply change (year): 1,958,538.80875

% Inflation: 0.0196%
```

It is still peanuts, no? Consider this playing out over _10 years_: 

```
Total supply: +19,586,038.70
Decade % Inflation: 0.196%
```

That is _still_ nothing.

## Playground spreadsheet

I built a spreadsheet on [Google Docs](https://docs.google.com/spreadsheets/d/1Cde3bZP7tQUI0sHqLcVAX2h1WOrqS-6OHZ5uOnT1btc/edit#gid=977708663) that you can go and play with different values for round time, or the parameters that John proposed, and see the outcome.

Make a copy of it (or download it) to be able to tweak the inputs and answer any other "but what if-" questions you may have.

## Conclusion

![](dall-e-pondering.png)

While the "fixed supply" model gave the community a sense of security and comfort that "beyond 2030 there would be no inflation", changing this assumption and model is absolutely worth considering. The upside to a change like this is moving the protocol towards self-sustainability, and - through incentivising block proposers - decentralization.

The downside to this particular instance of the model (with the specific parameters) is almost too small to measure. The 5 TPS scenario above would come with much larger problems than 0.2% inflation over a decade: it would mean that the blockchain has failed to get traction. At that point, does it even matter?

The break-even of 17~18 TPS average seems like the _least_ we should hope for in a successful, high throughput blockchain like Algorand - and on the arbitrary day that the "Musings" article as released, the protocol would have been (infinitesimally, again) deflationary already! 35 TPS is more than double the required break-even TPS for 2.87 second round times.


If you have not yet read ["Musings on the pond"](https://medium.com/@fishermanalgo/musings-on-the-pond-f1c6f6deeb72), go do that.

![](last.png)

Images generated with DALL-E.
