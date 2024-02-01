---
title: "Preliminary Advisory Report - Algorand 20-02-2023 Thefts"
date: 2023-02-27T21:26:38+00:00
slug: algorand-20-02-2023-thefts-preliminary-advisory-report
url: /algorand-20-02-2023-thefts-preliminary-advisory-report
tags:
- "MyAlgo Hack"
---

**Summary: There is a non-zero chance of a MyAlgo wallet software
compromise leading to the theft of at least \$7.2m worth of assets on
the Algorand blockchain. We recommend rekeying MyAlgo accounts to fresh
private keys, or simply moving funds where possible. This precautionary
remediation of further risk should not have usability impact and, if
done carefully, may have a significant security benefit.**\

We have been [day 1
responders](https://allo.info/tx/54QEQKNH66ZW3FT2LQU7QQ6LFX7QVABXJYK7LM6WAHJNQ3M5W2PQ)
to these attacks:
[reporting](https://twitter.com/Algo_Surf/status/1627827487668424707)
the potential compromises, organizing affected users, systematically
collecting as much information as possible in order to find a possible
common vector, suggesting actions to be taken, preparing transaction
trail documents for authorities. This case quickly grew with multiple
confirmations and more discoveries daily.

We were joined later in the week by [VantagePoint
Blockchain](https://twitter.com/vantagePoint_BC)
& [Nimble
Insurance](https://twitter.com/insurenimble)
as core investigators, as well as representatives from the Algorand
Foundation, Algorand inc, Rand Labs and Pera wallet.

### Impact, so far

Of the 13 addresses we identified on the day of the attacks as
\"suspicious/highly suspicious\", 12 have now been confirmed, and a
further 5 new addresses have been confirmed so far by impacted users and
organizations coming forward.

**A total of 17 addresses have been confirmed compromised with at least
\$7.2MM stolen in \$ALGO, \$USDC and other assets.** A further \$1.4MM
is suspected compromised in 4 more addresses.

4 more addresses were identified by Rand Labs a few hours ago for a
total of 25. We have not had time to look into those yet.

After establishing some potential areas of investigation we created a 48
question form for all affected users to answer, aiming to systematically
find commonalities in affected users\' environments.

The threads identified in all compromises were 1) use of the MyAlgo
wallet on desktop, as well as 2) a recent login (unlocking) into MyAlgo

No other software, dApps, wallets or other kind of vectors could be
identified to be shared between every affected user (or even most
users).

Some base facts:

-   To start from the very basics: public-key cryptography, and
    specifically Edwards25519 elliptic curves protecting Algorand
    accounts, are secure and not guessable or breakable.
-   The initial fraudulent transactions are single-signature Payment or
    Asset-Transfer transactions authorized by the proper keys. The base
    Algorand protocol was not exploited.
-   Delegated logic signatures have not been involved.
-   Rekeying has not been involved.
-   The attacks took place in close temporal proximity, clustering
    around a time window of less than 6 hours for the initial
    transactions.  

### Our Interpretations

From this point on we present our (D13) interpretations of the situation
with two disclaimers:

-   The situation is still unfolding; we want to present a checkpoint,
    and check out.
-   Some of our interpretations may not be shared by all involved
    parties.

Some possibilities we have considered and eliminated:

-   Weak key generation and entropy related questions have been examined
    and ruled out.
-   Gard [came
    forward](https://twitter.com/algogard/status/1629565940026187776)
    at some point in the investigation as an affected organization. As
    part of the ecosystem, a compromise of their frontend had to be
    considered as a common point of compromise of other users. However,
    this was quickly ruled out based on affected users\' reports.
-   Recent mac/iOS vulnerabilities have been eliminated as a vector:
    Multiple users not using Mac or iOS at all. While the timing of
    Apple\'s recent Remote Code Execution vulnerability patch was
    conspicuous, it turned out not to be a factor.
-   Browser-wide or operating-system-wide malware is considered
    unlikely: Metamask was present in many cases and it should have been
    the first target for theft. Cryptocurrency and NFTs valued in the
    millions in USD has been left untouched in the same environments
    where MyAlgo keys were compromised. Metamask and MyAlgo's storage
    locations would be technically different (extension storage vs
    website local storage/indexed DB) and both would be encrypted at
    rest (while locked) but overall, malware that could access one
    should also be able to access the other; and effort expended into
    exploiting Metamask would have multiplied dividends compared to
    MyAlgo. Metamask stealers or injectors may even be available
    off-the-shelf in the right corners of the Dark Web.

At this point in the investigation we are considering these two
scenarios as leading/most probable:

-   Each individual has had their seed phrase compromised through social
    engineering/phishing.
-   A MyAlgo.com compromise leading to targeted exfiltration of
    unencrypted private keys.

### It is always user fault

It is possible that all of these users and organizations were
compromised via phishing; however their responses, profiles & history as
users and organizations cast reasonable doubt that this is not the only
possible cause. Aside from the user reports, the behaviors we saw while
interacting with them showed vigilance, awareness of phishing, proactive
reporting.

Anecdotally, one affected user cleared his browser storage after he was
made aware of the attack; when he tried to log into MyAlgo again at a
later date, he was prompted to create a new wallet entirely. Rather than
proceeding, he messaged us reporting that he may have been phished after
all and asking "does that mean i was \*never\* connecting to the real
MyAlgo Wallet and it was a fake all along?". Some clarifications later
we let them know that it was related to clearing browser data.

Another compromised user is a visible owner of a high-value-target NFT -
the variety that is very frequently exposed to all sorts of targeting,
scams and phishing.

Another compromised user reported in our affected users\' group that one
of the investigators reached out to him over email unexpectedly. He
reported one of us to all of us, wanting to double check the email
contents. (The contents were checked and were not malicious.)

Aside from behaviors and impressions, the questionnaire has a section on
seed phrase management with a pointed question about the last time they
had restored a seed phrase into any wallet. More than 50% of collected
responses were either \"Never\" or \"more than 1 year ago\".

### \...except when it isn\'t

All in all, it is hard to definitively dismiss this attack exclusively
as user error. While user error is a common cause, it isn\'t always the
case:

[Solana Slope wallet leaks private key information](https://solana.com/news/8-2-2022-application-wallet-incident)

The aforementioned Solana wallet hack impact, while numbering in
thousands of wallets, resulted in fewer total funds lost (\$4.1m per
article.)

Mass exploitation is not the only way a supply-chain attack can be
fulfilled.

### \"If MyAlgo were compromised, my \$100 would surely be missing\"

A reasonable rebuttal to \"why are more addresses not compromised\"
would be \"because it would be detrimental to the attacker end goal\" -
assuming the attack is financially motivated.

More can be less: if thousands of accounts were compromised
simultaneously, the market would panic, the \$ALGO token could crash.

More can be harder: thousands of compromises would mean a lot of more
attention would be drawn to this case, making it harder to funnel the
stolen funds out of the ecosystem.

The assumption that an attacker would always try to maximize the amount
gained in any attack scenario does not always hold - there are tradeoffs
involved in everything and real-world crime does not come with a high
score board.

It *is* reasonable to us that an attacker could compromise MyAlgo and
\"only\" choose to steal \~\$8m from \~20 accounts. If anything, we are
surprised that it wasn\'t executed in a *more* drawn out fashion,
forcing a conclusion of user error and flying under the radar for
longer.

A interesting commonality to note it that certain users reported
multiple accounts compromised of medium-large value (say, 250K ALGO to
1M ALGO) all from the same wallet, whereas smaller but-still-large
accounts (one case of 80K ALGO, another distinct case of \~\$30K worth
of LP tokens) were also available on the same wallet. The least minimum
amount attacked so far is about 275K ALGO.

### Ongoing

The investigation is still ongoing. Law enforcement contact has been
made. We have not shared any details or leads that would compromise the
investigation.

Recommendations
---------------

So while we can not prove that there has been a MyAlgo compromise, we
have enough reasonable doubt to strongly recommend that MyAlgo users
rekey their MyAlgo accounts using Pera Web or Defly wallets, or if their
old addresses are not significant (governance, NFT minting addresses),
simply moving to a freshly created wallet on different wallet software.

(EDIT: While this advisory was being drafted, MyAlgo [issued a similar
recommendation](https://twitter.com/myalgo_/status/1630185695791706120))

The fact that we have not detected any movements from the attackers in a
week is not a guarrantee of continued silence and safety for accounts of
any size. Not your keys, not your crypto, remember? Since the blockchain
doesn\'t issue refunds, either move or rekey to be safe.

### Rekeying

Rekeying is a powerful feature of the Algorand blockchain that is akin
to \"changing your password\". You can create a new address on Pera web
or Defly, then import your MyAlgo address, and issue a rekeying
transaction from the MyAlgo address that will instruct the Algorand
network to disregard the MyAlgo private key/seed phrase and instead
delegate authority to the newly created address (and corresponding
private key/seed phrase.)

Your potentially-compromised MyAlgo account will now gain the benefit of
a brand new private key securing it, without having to change your
address, lose your governance commitment, or have to mint your next NFT
collection with a different address.

If you plan to rekey, make sure to **try rekeying in TestNet first, or
with a dummy account** on MainNet. Your account rekeying can
be tested in TestNet without compromising your MainNet access in case
things go wrong. Each network\'s rekeying status is, as one would
expect, completely independent of the others.

Pera iOS is known to have some issues signing at the moment which are
being worked on for release as soon as possible.

Pera Web Rekeying instructions:
[https://support.perawallet.app/en/article/how-to-rekey-an-algorand-account-with-pera-web-wallet-9alza3/?bust=1677517191020](https://support.perawallet.app/en/article/how-to-rekey-an-algorand-account-with-pera-web-wallet-9alza3/?bust=1677517191020)

Defly Rekeying instructions:
[https://docs.defly.app/app/rekey-an-account](https://docs.defly.app/app/rekey-an-account)

And we\'re out (mostly)
-----------------------

After this report we feel like it is a good time to conclude out
leadership part in this and formally hand over the investigation to our
friends and co-investigators at [Nimble
Insurance](https://twitter.com/insurenimble)
for continued impacted user support and collaborating with Law
Enforcement.

We lack the bandwidth to continue working on this as intensely as we
have done thus far. We have every confidence in both Nimble and
VantagePoint Blockchain to get the best possible result for impacted
users.

We will remain available on an ad-hoc basis to the individuals affected
and in a supporting role in the investigation, if needed.
