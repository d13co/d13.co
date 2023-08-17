---
title: "AlgoFi vault reward performance for Governance period 3"
date: 2022-07-04T02:18:38+00:00
slug: algofi-vault-reward-performance-for-governance-period-3
url: /algofi-vault-reward-performance-for-governance-period-3
cover:
  image: 1656927232.png
---

*TL;DR: Maximizing our vaulted ALGO with borrowed ALGO yielded more than
2x in governance rewards profit.*

For the third Governance season we tried the AlgoFi vault for
Governance: AlgoFi counts vaulted Algo as collateral that you can borrow
against. Borrowing Algo against your vaulted algo has two advantages:

-   You can add the borrowed algo to the vault, thus increasing your
    collateral and ability to borrow more Algo.
-   You are not exposed to liquidation danger due to price fluctuations
    between your collateral and borrow value, as they are the same
    ~~picture~~ price.

Your risk in this scheme is essentially confined to smart contract risk:
AlgoFi vault contracts failing either catastrophically (entire vaulted
amount lost) or partially (inability to vote and/or claim rewards). This
was palatable to our risk tolerance considering AlgoFi\'s reputation and
audits, so we tested it out on a few accounts.

The vault-borrow loop allows for increasing your initial amount by more
than 2.8x. The borrow utilization percentage that is normally very
important to avoid liquidation can be ignored and pushed to the limit.

When calculating performance, we will look at the cost of the loan (and
subtract the Aeneas rewards that we collected) and compare the
governance profit against participation without loan.

One of our vaults was seeded with 700.49 of our own Algo, against which
we borrowed an extra 1300.51 ALGO to end up with a nice round 2000 ALGO
committed for governance (we committed 1 ALGO less than our balance for
extra safety / superstition). Our initial amount was multiplited by
about 2.85x.

On AlgoFi, your interest is added to your borrowed amount. The final
borrowed amount was 1314.48 and we collected 4.55 ALGO as rewards from
using the platform, making our loan cost 9.43 ALGO for an effective APR
of 2.9%.

Our rewards were 39.79 ALGO, for 30.36 ALGO profit.

**This works out to a period rate of 4.33%, or APR of 17.34% - about
2.18x the \"unvaulted\" APR of 7.9%**

{{< figure src="1656926523.png" title="Account B is the one described here" >}}

Our other account has slightly better performance - possibly a mistake
during data hunting & gathering.

Are we happy with out choice? Yes, we are.

Is it going to be as good for the next period? Probably not:

-   The Aeneas rewards were a good (average) 1.4% discount on our loan
    cost, but that reward percentage has decreased during the period
    (currently 1.16%). They will also end at some point.
-   It is all about effective loan cost APR vs governance APR:
-   If all the Algo in the ecosystem participates in Governance this
    season, the rewards will be tiny.
-   If the ALGO borrow cost exceeds governance rewards, you will be
    worse off for using it.

Are we going to do it again? Yes, we are.
