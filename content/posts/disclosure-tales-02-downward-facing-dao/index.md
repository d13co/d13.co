---
title: "Disclosure Tales 02: Downward Facing DAOs"
date: 2023-12-20T16:06:38+00:00
slug: disclosure-tales-02-downward-facing-daos
cover:
  image: TODO.png
tags:
- "Vulnerability Disclosure"
- "TEAL Audit"
- "Whitehat Operation"
---

I discovered and disclosed a vulnerability in the [Updog](https://www.updog.vote) and [FAME](https://www.algofame.org/dao) DAO contracts. Then I hacked them. This story is not boring.

## Background: The DAOs

[Updog](https://www.updog.vote) was offered a fully featured DAO platform. In a nutshell:

1) Each DAO instance has a governance token that can be staked and withdrawn.

2) The DAO contracts could control assets and ALGO. Payments of both types could be executed trustlessly after a proposal passed with enough votes.

3) Voting power is proportional to the staked amount of governance tokens in the DAO.

The most notable Updog DAO was the "Coffeebean DAO", which housed a large number of NFTs with an minimum floor value of over 56,000 $ALGO.

The FAME DAO launched recently. It licensed the Updog contracts but had its [own frontend](https://www.algofame.org/dao).

## The vulnerability

Due to insufficient validation in the staking method, a malicious user can drain all governance tokens from the DAO, as well as gain super-majority voting power in the DAO.

### A normal staking call

The staking method normally [looks like this](https://app.dappflow.org/explorer/group/6n2fxAxrIlK7zap1%2BhWitBo0xnCFa1lDGAiEp1g4ih8%3D/33028267/transactions):

![](good-stake.png)

1) An asset transfer of the governance token (BEANGOV) to the contract's escrow address (B43GQ..)
2) An Application call with the staking method argument `ls` / `bHM=`

The stake call would then increase the total locked amount (`tl` in global state) and the user's staked amount (`s` in local state.)

![](good-stake-state.png)

### A malicious staking call

The contract code does not validate the staking transaction group's size. This means that a single asset transfer could be padded with 15 staking application calls, and the user would be credited with 15x more stake than they sent.

The credited stake could then be withdrawn (at a cost of 1 ALGO, usually), so to drain the contract of all governance tokens, a user could start with a trivial amount of tokens, and then loop stake-withdraw calls until they withdraw all the tokens. In just 3 deposit-withdraw cycles, the initial governance token would be withdrawn 3375x at a cost of 3 ALGO.

Due to how this story unfolded, you can see an example of this on-chain [here](https://app.dappflow.org/explorer/group/4OMym%2FVi3WKs8PLkEJESsclkQtNUJBI7KGshLgJcTrA%3D/34464554/transactions):

![](bad-stake.png)

_(It is generally not cool to do this. [Simulate can be used to confirm and disclose a vulnerability](/posts/disclosure-tales-01-honing-fire/#simulating-validation) without leaving the exploit on-chain in plain sight. I plead extenuating circumstances later on.)_

## Disclosure

I disclosed this to the Updog developer on November 8, 2023.

I sent an email explaining the situation and offering to help rescue the assets. Since the contracts do not have an admin functionality that can circumvent the voting process, the only way to recover the assets would be to attack the DAOs with this exploit.

## State of Affairs

### Updog DAOs

The Updog frontend stopped working some time in the summer of 2023. Currently, the site loads the two main DAOs (degen and coffeebean) but some backend component prevents it from rendering proposals, so it is not usable via the normal route. Some user created DAOs no longer show up there.

My read on the situation is that the developer moved on after a lack of traction and general interest. In the Coffeebean discord, there has been conversation about recovering the NFTs locked in the coffeebean DAO contract. Some users are grated that the frontend does not work. I empathise with both sides here:

The Updog developer has not made any profit from his efforts, and the fruit of his labor went largely unused, especially lately (2023.) Users demanding that he put in more work can come across as entitled.

On the other hand, some token holders wanted to vote out certain NFTs and did not have a viable option to do so.

A possible middle ground here would have been crowdfunding some amount for the developer to fix the frontend, but this did not materialize.

This situation can spark an interesting discussion about "community" development: how long, or how much, is a developer "obliged" to keep working for free? And many such questions. This discussion can be held elsewhere. This will be long enough as it is.

### FAME DAO

The FAME DAO's current iteration was deployed very recently - [Oct 28th, 2023](https://app.dappflow.org/explorer/transaction/DDYRVWJH6C6RIQIXADWK7Q6VK63VPZVKXZKCT3XCHAVB5WH554RA). Its frontend is still operational and the DAO has voted on several proposals.

## Disclosure follow-up

I followed up on the disclosure one month later - December 8th, 2023. There was no plan to intervene and recover the assets, but the Updog developer notified the FAME DAO head (Bilal) after my follow-up.

The FAME DAO development has branched from the Updog contracts after they were licensed. Bilal was interested in fixing the vulnerability and redeploying a safer contract.

However, this couldn't be done without users noticing. Word of "an issue" with the DAO contract would get out, and it would be a small leap to look at the other DAOs as well.

![](meme.jpg)

### Decision time

If you are D13 in this situation, would do you do? Choose your own adventure:

The vulnerability you found and reported would likely get out. It isn't exactly rocket science either, and with 50K+ ALGO worth of Lizards and Berds in just one of the DAOs, this would likely motivate people to steal everything out of the vulnerable DAOs. (JPEGs are addictive, don't start)

**Do you...**

🙈 Claim "not my circus, not my monkeys" and let the pieces fall wherever they may?

😬 Agonize over the ethics of attacking the DAOs to rescue the assets in order to return them?

---

![](whitehats.jpg)

I went with "agonizing". I used the phone-a-friend helpline twice to check myself that this is the right thing to do. The phone friends didn't try to convince me that this was a bad idea, which leads to this disclosure tale turning into a white hat operation story: 

I would try to recover as many of the assets as I can out of the DAOs and return them as best I can.

## The plan, vaguely

Each DAO's governance token holdings would be easy to recover. E.g. the FAME DAO mostly had value in FAME, which was also their governance token, so that would take mere minutes to execute: a few loops of `deposit 15x -> withdraw stake` and all the FAME would be recovered.

Everything else held by the DAO contracts - ALGO, NFTs, ASAs - would have to be voted out, which would take some time.

After draining the governance tokens, that would give me a big advantage, as I could stake 15x that amount in each deposit/withdraw loop, but still:

1) most of these DAO governance tokens are circulating and available
2) the deposit 15x / withdraw loop would be recorded on chain, and someone could copy it and try to take over

A situation where I am contested while draining the DAOs would not be optimal. This was complicated enough already without having to battle someone else for majority.

### Hush now

The few people in the loop were informed of the intended operation and agreed to keep it on the down-low while it was happening. Myself and two friends would monitor social channels for any potential chain snoopoors that noticed something is amiss.

{{< details "A message explaining the situation was hashed and distributed in order to plead for cooperation (...silence...) if someone did notice." >}}
The message:

```
=============HASH BELOW THIS LINE==========
The Updog DAO code contains a critical vulnerability that allows hostile takeover. Some of the affected DAOs: Updog, Coffeebean, Fame.

The Updog developer, as well as the Fame DAO head, have been notified of this vulnerability. The devs working with Fame (who licensed the Updog code) are working on a patched version.

When the Fame DAO is migrated to the patched version, the existence of the vulnerability will become known. At that point it will be inevitable that someone would look closely at the other DAOs that share the code, and it would become a race to take over and steal those assets.

Doing nothing would almost certainly result in the DAOs being attacked by someone else. As such I think the right thing to do is to attack the DAOs and recover all the assets in order to return them to their rightful owners.

The Coffebean DAO holds 564 different assets, all of which have to be voted out sequentially, which will take some time.

If you are reading this before the situation is made public, please consider keeping it to yourself, or contacting me* privately if you have concerns. While the exploit enables a kind of first-mover advantage - which I am utilising - my control over the DAOs can still be contested while the rescue op is ongoing. If you want to beat me over the head for this decision, you will have an opportunity to do so soon enough, without risking the operation that is already in progress.

The hash of this message will be posted on-chain in advance of the attack from my address DTHIRTEENNLSYGLSEXTXC6X4SVDWMFRCPAOAUCXWIXJRCVBWIIGLYARNQE

I will do my best to ensure a fair outcome for all involved.

- Bit @ D13

* Contacts:

Email: bit@d13.co

X: @d13_co

If I am unavailable, @GovernorHat - /u/GhostOfMcAfee is also in the loop about some high level details.

=============HASH ABOVE THIS LINE==========
```

Hash: 63fedd015bbd8e9337e152ea8459ff4d97dba3984cf0e200dda12427321e8774 (SHA256)

Txn ID: (note) https://app.dappflow.org/explorer/transaction/RJMAEFB663XP54CYQTECI4ACNFUZQIF7L4CHBOWUHDYBL2DVC3FA

{{</ details >}}

With the Updog frontend non-operational, the only web-facing hint that something is amiss would be the FAME DAO frontend. Bilal agreed to put up a maintenance notice and wait until this operation is complete before announcing anything.

## The plan, more concretely

As mentioned in the hashed message, the coffeebean DAO held hundreds of assets (564) so a manual operation is entirely out of the question.

I cloned the coffeebean contract in a local Algorand sandbox and started coding a bot.

One of the Updog features that enabled this operation to take place at all was the "change duration" type of vote. The default configuration for coffeebean was: 3 day voting period, plus one day cooldown between votes. If this could not be changed, it would take over 6 years to recover all the assets.

The minimum accepted voting duration was thankfully very short (60 seconds) and the cooldown is also configurable (30 minutes minimum.) After getting stake supermajority, the first order of business was to change the duration to the minimums.

The DAOs also have a configurable required threshold for a vote to pass. This was also set to the maximum possible amount, in order to deter votes passing against my stake (slashing was also possible) in case my bot malfunctioned while I was not monitoring the progress.

Coffeebean supports a proposal type that votes out 3 NFTs at a time, which was handy for accelerating the recovery - this was also utilized where possible (single amount assets.)

The overall flow of the bot was:

- Configure duration
- Configure pass threshold
- Vote out NFTs, ordered by their value
- Vote out ASAs and multimint NFTs, no particular order
- Vote out ALGO

More granularly, each of these steps includes:

- Proposing the vote
- Checking if a vote is active
- If the active vote is desirable, vote it up
- Waiting for the voting period to end
- Executing the vote outcome, if it is desirable
- Waiting for the cooldown period to end, so that the next vote can be proposed

These checks were performed every single round.

Finally, each DAO is different - application ID, governance token asset ID, etc. - so the bot would have configurations so that it could be executed in tandem for multiple DAOs at once.

While I hadn't realized at the time, some of the DAOs also differed significantly in implementation.

## Go time

December 16 was Go Time.

The FAME tokens were recovered first using this account: [ZZLPDZA5774SFE7HQUSSHNGI7FRCX5VQMXH7KUZYEE7WWXLM5KSNECXEKU](https://app.dappflow.org/explorer/account/ZZLPDZA5774SFE7HQUSSHNGI7FRCX5VQMXH7KUZYEE7WWXLM5KSNECXEKU/transactions).

All Updog DAO related transactions were performed from this account: [325OX7FO743TRL7N7W534L6P7U5ZXJCCUAP57N46KDN7AXPAV6OXT5L74Q](https://app.dappflow.org/explorer/account/325OX7FO743TRL7N7W534L6P7U5ZXJCCUAP57N46KDN7AXPAV6OXT5L74Q/transactions).

Updog DAOs attacked were:

- [Coffeebean DAO](https://app.dappflow.org/explorer/application/1108232468/transactions)
- [DEGEN DAO](https://app.dappflow.org/explorer/application/1018462173/transactions)
- 
-
