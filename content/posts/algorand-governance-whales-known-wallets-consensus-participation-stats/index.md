---
title: "Algorand Governance Period 4 Whales: Known wallets & Consensus participation statistics"
date: 2022-08-22T21:26:38+00:00
slug: algorand-governance-whales-known-wallets-consensus-participation-stats
url: /algorand-governance-whales-known-wallets-consensus-participation-stats
cover:
  image: gov.png
tags:
- Governance
---


As a follow-up on our report on [Voting Power Centralization in
Governance Period
4](https://d13.co/algorand-governance-voting-power-centralization-period-4/)
we decided to look into known addresses from the governor whale list, as
well as their consensus participation status.

In case you missed it and can\'t be bothered to check, we defined
\"whale wallets\" as single-entity governors that have committed at
least 1 million ALGO and are still eligible. We excluded the top
governor - Folks Finance - as their vote is decided by Folks protocol
users.

Data Sources
------------

We only know of one source that maps addresses to a name or label -
AlgoExplorer.io - and their data set is bound to be incomplete.

We figured out that AlgoExplorer.io will gladly tell you their internal
address labels if you ask politely (see [Appendix
B](#appendix-blookup-method).)

Data Highlights
---------------

### NO CEX?

We could only identify two known parties in these wallets:

-   Algorand inc (225m)
-   NF Domains treasury (1.3m)

To our surprise, not a single (known) CEX address was in there. Given
that many CEX offer \"staking\" for Algorand, this result likely means
that they *are* participating, just not via their identified hot
wallets.

### Algorand inc commitment

Aside from NF Domains, the only wallets that were labeled by
AlgoExplorer.io were 11 Algorand inc wallets which committed 224,969,952
ALGO, or 5.91% of the total 3.8B commitment.

5 of those 11 wallets are marked as \"NotParticipating\" status, which
we had to look up: it means that an address has permanently opted out of
participating in consensus and receiving rewards. (We asked why this
option exists [on the Algorand
forums](https://forum.algorand.org/t/why-does-nonparticipating-exist/7691).)

81% of the total Algorand inc commitment is participating in consensus.

### Participation Statistics

To our further surprise, the top wallets have a *significant*
participation percentage among them:

-   1,435,727,940 whale ALGO participating, out of
-   3,441,123,684.10 whale ALGO committed total, so
-   41.72% of whale stake is active in consensus

The identified Algorand inc wallets add up to just 12.69% of the
participating stake, with the rest being -as of yet- unidentified.

From a number-of-participating-addresses perspective the numbers are
less impressive: 37/212 whale wallets (17.4%), but this doesn\'t matter
as much as the staked ALGO.

Discuss?
--------

On
[Twitter](https://twitter.com/d13_co/status/1561835514457718791)
or
[Reddit](https://www.reddit.com/r/algorand/comments/wv6ku3/algorand_governance_period_4_whales_known_wallets/).

Appendix A - Data {#appendix-adata}
-----------------

Our spreadsheet is publicly available as a [Google
Spreadsheet](https://docs.google.com/spreadsheets/d/1QawHpqonBhdvYClIDcFe52FFZyuFrx5enPPiVdVtCBQ/)
or you can download the [Excel
file](top-whale-names-and-consensus-status.xlsx)
directly.

**Note that there are 4 sheets**: Raw Data, Known Addresses, Algorand
inc and Participating Stats.

Appendix B - Lookup Method {#appendix-blookup-method}
--------------------------

We used a query like this to look up address names and consensus status
on AlgoExplorer.io:

```
curl -s "https://indexer.algoexplorerapi.io/v2/accounts/$addr?include-all=false&apps-local-state-limit=50&assets-limit=50&exclude=created    -apps,created-assets" -H 'User-Agent: Mozilla/5.0' -H 'Accept: application/json, text/plain, */*' -H 'Accept-Language: en-US,en;q=0.5' -H 'Origin: https://algoexplorer.io' -H 'Connection: keep-alive' -H 'Referer: https://algoexplorer.io/' -H 'Sec-Fetch-Dest: empty' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: cross-site' -H 'TE: trailers' \
| jq -r '[.account["address"], .account["address-name"], .account["address-url"], .account["status"]] | @csv'📋
```

This request and post-processing will output the address, address name,
address URL and consensus participation status for each address queried.
We ran each address from the previous report in order to get our data.
