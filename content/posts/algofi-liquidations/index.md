---
title: "Every AlgoFi Liquidation: Stats & Data"
date: 2022-04-20%00:00:00+00:00
slug: algofi-liquidations-stats-data
url: /algofi-liquidations-stats-data
cover:
  image: liq1.png
---

Following a positive response to [a reddit post](https://www.reddit.com/r/algofi/comments/tyid2i/anyone_interested_in_a_liquidation_monitoring/)
I made about the need for an AlgoFi borrow utilization & liquidation
notification service, Hellen and I started looking into
[AlgoFi](https://algofi.org/)
blockchain data relating to lending & liquidations. We prepared a nice
spreadsheet with every single liquidation, as well as some nice stats.

### What\'s a liquidation?

When you take a loan out on AlgoFi, if your collateral\'s value drops to
be worth less than your maximum allowed borrow value\*, your account can
be liquidated.

> A user liquidates (the \"liquidator\") another user (the
> \"liquidatee\") by repaying up to 50% of the liquidatee\'s borrow and
> seizing their collateral at a *discount*.\
> -  [AlgoFi Docs](https://docs.algofi.org/algofi-lending/master/liquidating-users)

That discount is 7% and is referred to as \"liquidation incentive\".

\* *Technically it may also happen due to unpaid accumulated interest,
but this would take a long time, and in 2022 crypto space, currency
fluctuations - even between stablecoins (cough STBL cough) - are far
more likely to kill your collateral than accumulated interest.*

### Drumroll please

*A*s far as we know, liquidations have been somewhat opaque so far.
Based on our interpretation of the data, a handful of addresses perform
liquidations but a fair few have happened in AlgoFi lending history
(over  2,300 in just over 4 months) and total a fair bit of change
(\~\$1.6M).

We present to you some data insights into the liquidations game of
AlgoFi. We have (probably) found and analyzed all liquidations that have
happened on AlgoFi. We did this by walking the blockchain backwards from
\"now\" until before AlgoFi was a thing and looking for \"type L\"
transactions - liquidations. We then did it again, this time guided by
an indexer to point at specific blocks to look at.

You can find the data at the end of this post in handy spreadsheet if
you want to play around with it yourself, but who has time for this
nowadays - it\'s sexy stats time! But first, a sexy disclaimer and a
boring explainer:

{{< callout emoji="⚠️" text="We are fairly confident that we have gotten all liquidation data correctly, but not 100% confident. Some liquidations may have been missed, or some may have been misprocessed by us." >}}

{{< callout emoji="ℹ️" text="All USD prices are rough approximations calculated with \"today\'s\" exchange rates - April 20, 2022" >}}


Stats
=====

Sexy stats time range: From AlgoFi genesis until 20 April 2022

-   First liquidation was at block 18043632, which was agreed upon at
    Wed Dec 15 20:05:46 UTC 2021
-   Number of liquidations: 2,307
-   Number of liquidators: 19
-   Number of liquidatees: 935
-   Sum of all liquidations by seized collateral value: \~\$1.6M
-   Sum of liquidation incentives (7% liquidator profit): \~\$113K
-   Most successful liquidator by number of liquidations:
     [2HB66TH3RORMXG4G2F5CIIUA2CDM2DFMNX2P3ZAOBQ3TFXDGUG2KFCDL4Y](https://allo.info/address/2HB66TH3RORMXG4G2F5CIIUA2CDM2DFMNX2P3ZAOBQ3TFXDGUG2KFCDL4Y)
    with 1833 liquidations. By a mile - \#2 is at 117 liquidations.
-   Most successful liquidator by seized collateral value is,
    unsurprisingly, the aforementioned 2HB66T..FCDL4Y, with a total of
    \$815K worth of liquidated collateral. The liquidation
    incentive/profit of which works out to a neat \$57K.
-   The [most expensive single liquidation
    transaction](https://allo.info/tx/group/KqJSqthnEAB3SL8Fqob3c6vermnntPxsJQ1G6nQDjro%3D)
    so far involved paying off 161,915 USDC to seize 176,200 ALGO.
    Liquidation incentive for that was \~12K ALGO.
-   Most liquidated account by number of individual liquidations:
    WBHJL6KP7LVEOQ6LT47UT7WVWSL3NRR57WUIX2DLVASJQWCRBDQEAGGCD4 with a
    whopping 79 individual liquidations.
-   Most liquidated account by seized collateral value: WBHJL6\...AGGCD4
    again, with a whopping \$412K total collateral seized in today\'s
    fiat value. 7% \~= \$29K

### Who are the liquidators?

\"Anyone\" can liquidate. It just requires some coding. The [AlgoFi
lending
SDK](https://github.com/Algofiorg/algofi-lend-js-sdk/blob/master/src/v1/liquidate.ts)
makes this easy if you have a little bit of programming experience - but
you also have to know which account you can liquidate.

In practice you can see that most liquidations happen by a handful of
users, or, more likely, their faithful silicon minions (bots).
~Note\ to\ self:\ name\ next\ computer\ silicon-minion~

Top liquidators
---------------

All 19 of them are 🔝, but some do a bit better than others.

We can see the top 6 liquidators have the lion\'s share and have made
some nice change in exchange for their service to the platform\*.

_* This is not sarcastic, liquidations of bad loans **must** happen if you want your lent goETH to supply you with that nice lending APR instead of disappearing into the void that swallows most altcoins. This is DeFi, right? These bad loans are holding users' assets without full collateral._


{{< figure src="image-22.png" title="All AlgoFi Liquidators, ever" >}}


Most Liquidated
---------------

The liquidatee side of the hall of fame.

{{< figure src="image-15.png" title="Hall of Flame" >}}

### MVL

Most value liquidated:

{{< figure src="image-23.png" title="Largest individual liquidation transactions by collateral value in USD." >}}

### Most common seized collateral by USD value

{{< figure src="image-24.png" title="bALGO = ALGO" >}}

Seizing assets pays bAssets, which can then be converted into their
canonical versions with, you guessed it, some code. Using the AlgoFi
Lending SDK you can [burn some bALGO into ALGO](https://github.com/Algofiorg/algofi-lend-js-sdk/blob/master/src/v1/burn.ts), bgoETH into goETH, and so on.

~~Technically all of these should be bSOMETHING - not sure why some
liquidations paid back ALGO instead of bALGO. That\'s a mystery to be
investigated elsewhen.~~

Update: Mystery solved by kind redditor /u/adioc [here](https://www.reddit.com/r/algofi/comments/u7oz29/every_single_algofi_liquidation_stats_data/i5gksok/):

> This is the result of a recent introduction of vaulted ALGO. vALGO
> liquidates directly to ALGO.

This tracks with us. First ALGO liquidation was at round 20233268, Tue
Apr  5 23:56:15 UTC 2022. Vault went live on March 31st according to
this [AlgoFi tweet](https://twitter.com/algofiorg/status/1509552621014728713).
Hooray for crowdsourced intelligence!

### Most common repaid loan asset by USD value

{{< figure src="image-25.png" >}}

### Most Common Liquidation Use Case

Using our extrapolating skills, the last two tables should tell us that
the most common liquidation scenario (by almost an order of magnitude)
is a user putting up ALGO as collateral to take out stablecoin loans.
ALGO price then dips *a bit*, and the collateral gets a haircut.

The Data
--------

Raw transaction data & various statistics sheets are available here:

[Download
AlgoFi-Liquidations.xlsx](AlgoFi-Liquidations.xlsx)

The spreadsheet above includes a group transaction for each liquidation
(column grp\_txn). You can search that on AlgoExplorer.io and see the
liquidation yourself! E.g. the first liquidation at round 18043632 had
group ID YGST8hii9P9OL0SOPqJeaJy2dnhDN21GJQcHr3slsGY= which you can see
on allo.info
[here](https://allo.info/tx/group/YGST8hii9P9OL0SOPqJeaJy2dnhDN21GJQcHr3slsGY%3D).
It is quite fascinating.

### The Service: LiquiFi, NotiFi, NotMeFi or something

Congrats, you reached the advertisement part that is mandatory in all
blog posts nowadays (it\'s the law.)

**We are building a service that monitors your borrow utilization in
real time in order to notify you and hopefully avoid getting
liquidated.**

As part of our marketing ploy we will likely also include a realtime
dashboard of liquidations, if not a searchable interface of all past
liquidations. So there\'s more of this to come, but *iinn reeallll
tiiimmeeee!* 🏎

If you want to suggest your favorite way of getting notified or have any
ideas about this, let us know publicly
[here](https://www.reddit.com/r/algofi/comments/tyid2i/anyone_interested_in_a_liquidation_monitoring/)
or privately
[here](mailto:d13@d13.co). We
have started writing up some details about this project
[here](https://d13.co/algofi-borrow-utilization-monitoring-service/).

If you want to know when we\'re done building it, you can subscribe to
our newsletter for updates - we won\'t send needless shit, ever. Spam is
dead, anyway, nowadays it\'s all about sending you zero amount
transactions with viagra links in the tx note.

Hope you enjoyed reading as much as we enjoyed putting this together.

See you later, liquidater.

\- Bit & Hellen
