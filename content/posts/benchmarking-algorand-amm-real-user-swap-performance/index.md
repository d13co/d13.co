---
title: "Benchmarking Algorand AMM 1:1 real world swap performance"
date: 2023-01-11T02:18:38+00:00
slug: benchmarking-algorand-amm-real-user-swap-performance
url: /benchmarking-algorand-amm-real-user-swap-performance
cover:
  image: 1673476543.png
---

TL; DR: We tested Algorand with end-user-identical AMM swaps: 8,070 in a 3 second block.

------------------------------------------------------------------------

Our friends at
[Vestige.fi](https://vestige.fi/)
recently performed a benchmark of AMM swap performance on Algorand
MainNet. While the results were great (2881 peak swaps per second), some
naysayers missed the forest for the trees with complaints about the
methodology being synthetic.

The
[methodology](https://discord.com/channels/491256308461207573/491256308461207575/1061347210060644413)
by the Vestige team was:

-   \"We sent 353 groups of 85 swaps totaling 90368 transactions / 30005
    AMM swaps. Algorand therefore handled 30005 AMM swaps in \~15 sec,
    or about 2000 swaps/s. If we discount the last \~500 swaps in the
    806 block we instead get 29500/11 sec = 2680 swaps. If someone
    smarter than me has data on block times we could do better
    calculations, in case blocks were delayed or so. \"
-   \"all transactions were made from
    https://algoexplorer.io/address/SWAPVMWRFIIY2L5V2JEWXIE7TLSOCUJP4BJYMAM65VBMRXHHE24GBMMPYM
    which called the app 1000469889 which does 85 swaps in inner
    transactions (255/3)\"

On Algorand, inner transactions are transactions initiated by a smart
contract. As such, they don\'t need to come with a signature attached -
the outer transaction call\'s signature suffices.

Algorand\'s performance is limited by the current maximum block size of
about 5 MB. Real user swaps would have 2x outer transactions along with
their signatures, so we would expect the performance to still be in the
thousands of swaps per second, but still a bit less than the absolute
ceiling set by the inner transaction tests by Vestige.

Real-User AMM swaps
-------------------

We set out to recreate the test but using the exact structure of real
world AMM swaps.

As with swaps initiated via the frontend on
[Pact.fi](https://app.pact.fi/),
each swap consisted of two outer transactions in a group:

-   1x payment to the contract address
-   1x application call to the contract to swap

Methodology
-----------

We used the Pact.fi Javascript SDK to sign 16,000 swaps with a
first-last-round validity of 4 rounds. What we realized in earlier tests
was that we would have more trouble sending these transactions through
our nodes fast enough, than Algorand would have to process them.

In order to send these, we signed the 32,000 transactions ahead of time
and copied them as files to 4 algod nodes - 2 archival medium-power
nodes, and 2 very weak light nodes. A simple \"wait for status after\"
script was used as the racegun to start sending them with
`goal clerk rawsend -f swaps` at round 26196666.

In order to improve our odds and send rate, we generated the transaction
files twice, once in normal order and once in reverse, and divided our
nodes into sending them forwards and backwards at the same time. For
best results we could have split into 4 groups.

Our nodes were still not fast enough to broadcast all these in time - we
got 15489 / 16000 sent. Our nodes were still trying to broadcast
transactions at round 26196682 - 13 rounds and \~48 seconds after the
transactions were no longer valid, so a single queue would not have been
fast enough.

{{< callout emoji="💡" text="Worth noting that these are benchmarking woes, not real-world woes: Real-world `algod` infrastructure like [algonode.io](https://algonode.io/) is distributed around the world, so 16,000 real users wanting to swap at the exact same second would not have to push through our 4 puny nodes. " >}}

Results
-------

Due to our lag in sending the transactions, the swaps were processed
over 3 blocks:

| round    | txn counter (tc) | timestamp (ts) | ts diff | tc diff | amm swaps | spot swaps/s | others’ txns |
| -------- | ---------------- | ---------- | ------- | ------- | --------- | ------------ | ------------ |
| 26196665 | 1008497390       | 1673472332 |         |         |           |              |              |
| 26196666 | 1008497419       | 1673472335 | 3       | 29      |           |              |              |
| 26196667 | 1008511628       | 1673472339 | 4       | 14209   | 4725      | 1181.25      | 34           |
| 26196668 | 1008519717       | 1673472346 | 7       | 8089    | 2694      | 384.8571429  | 7            |
| 26196669 | 1008543974       | 1673472349 | 3       | 24257   | 8070      | 2690         | 47           |
| 26196670 | 1008544017       | 1673472355 | 6       | 43      |           |              |              |
| 26196671 | 1008544047       | 1673472359 | 4       | 30      |           |              |              |
| 26196672 | 1008544064       | 1673472362 | 3       | 17      |           |              |              |


*You can find this data in Appendix A.*

The last - and heaviest - block, weighing in at 5.018 MB, processed 8070
AMM swaps with a 3 second timestamp difference from the previous block.

**The \"spot\" swaps per second performance for block 26196669 was 2690
swaps/second.**

(Since the timestamps have second-level granularity and round up
milliseconds, the worst case time of 3.49 seconds works out to 2312
swaps/second; best case at 2.5 seconds would be 3228 swaps/second.)

Counting from when we started sending them at round 26196666 until the
last valid round of 26196669, Algorand had finalized 15,489 AMM swaps in
14 seconds, with an average of over 1100 swaps per second. Based on what
we saw on our nodes\' end, the bottleneck was sending each individual
transaction over our nodes, as opposed to the network processing them.

The data includes a few rounds before and after our test as a measure of
the impact to the network with regards to block timing: it was
negligible. During the test, one block test has a 7 second timestamp
difference compared to the average of 3-4 seconds, and then it was back
to clockwork.

{{< figure src="1673473191.png" title="AlgoExplorer screenshot of the busy blocks" >}}

But can it sustain TPS? \... Yes. {#but-can-it-sustain-tps-yes}
---------------------------------

A valid question would be how long Algorand can sustain a high rate of
transactions. For our project
[TheBillBored.com](https://thebillbored.com/)
we did 1,066,803 transactions in 213 seconds (average 5008.46 TPS) in
order to \"snipe\" Asset ID One Billion. We intentionally didn\'t even
use up 100% of the network\'s capacity! [Story
here](https://twitter.com/TheBillBored/status/1610360365384142851).

``` {style="position: relative;"}
Block 25990194 start transaction counter: 998,933,246
Block 25990245 end transaction counter: 1,000,000,049
Transactions: 1,066,803
Seconds elapsed: 213
Average TPS: 5008.46
```

Conclusion
----------

If you can send them fast enough (we barely could) Algorand will happily
process **thousands of** **real world AMM swaps per second**, with a
peak in the high two thousands - much like the test results from our
friends at
[Vestige.fi](https://vestige.fi/).

In case you weren\'t paying attention earlier, this test had the **exact
transaction structures that real users would perform** at
[Pact.fi](https://pact.fi/),
so it\'ll be a lot harder to hand-wave away.

Appendix A - D13 test data
--------------------------

Aggregate data available on [Google
Sheets](https://docs.google.com/spreadsheets/d/1DPDzZNIre3hGuBhC28VIE-JT3vVZn_vpFb0y8vdV-SI/).

See the transactions: [BENCHMAKER.. on
AlgoExplorer](https://algoexplorer.io/address/BENCHMAKERWFHU3YPNJIXT6F7JIDWJJQF46KW4P4WGXUX7ELTPM6JTUZ2A).

Appendix B - Vestige test blocks & transaction count: {#appendix-bvestige-test-blocks-transaction-count}
-----------------------------------------------------

26418:
[https://algoexplorer.io/block/26101803](https://algoexplorer.io/block/26101803)

31250:
[https://algoexplorer.io/block/26101804](https://algoexplorer.io/block/26101804)

31241:
[https://algoexplorer.io/block/26101805](https://algoexplorer.io/block/26101805)

1567:
[https://algoexplorer.io/block/26101806](https://algoexplorer.io/block/26101806)

[Source](https://discord.com/channels/491256308461207573/491256308461207575/1061347210060644413)

