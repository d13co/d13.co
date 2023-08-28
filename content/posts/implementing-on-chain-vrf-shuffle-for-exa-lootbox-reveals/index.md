---
title: "Implementing an on-chain VRF shuffle for EXA Lootbox Reveals"
date: 2023-08-28T18:58:00+03:00
slug: implementing-on-chain-vrf-shuffle-for-exa-lootbox-reveals
cover:
  image: dice.jpg
---

Following a brief partnership during [CupStakes](https://cupstakes.world) - where [EXA.market](https://exa.market/) was our official secondary marketplace - they commissioned me to implement the smart contracts that would power their [rewards program](https://exa.market/rewards).

As a new marketplace in the Algorand ecosystem, EXA wanted to incentivize users to trade on their platform. Users were rewarded with ["Lootbox" NFTs](https://explorer.perawallet.app/assets/1003527093/) for using the platform.

After the lootboxes were distributed, we revealed that there were two more kinds of lootbox users could get. By merging 3 of their original (level 1) lootboxes they could get a [level 2 lootbox](https://explorer.perawallet.app/assets/1108385957/), and by merging 3 of their level 2 lootboxes they would get a [level 3 lootbox](https://explorer.perawallet.app/assets/1108387538/). This "merge" was performed by the first smart contract I developed for EXA.

## Lootbox levels

The mechanics of the higher level lootbox were not explicitly outlined at the time, but the implication was:

- You would get fewer prizes (1 prize per lootbox)
- It would somehow be better than keeping level 1 lootboxes (one would hope)

Users who took this leap of faith would indeed be rewarded. A few minutes before this article was published, the higher level lootboxes mechanics were announced: 

- Level 2 (L2) lootbox: guaranteed top 25% prize (at the time of the draw)
- Level 3 (L3) lootbox: guaranteed top 6.25% prize (at the time of the draw)

Both L2s and L3s guarantee better odds at a top prize than the sum of their parts. An L3, for example, has 100% chance of getting a top 6.25% prize, whereas its individual ingredients (9x L1 lootboxes) have a cumulative ~56% chance of achieving the same.

## Revealing requirements

The reveal contract's job in a nutshell is "accept lootbox, send back prize". Its requirements seem simple enough:

- (when created) accept an arbitrary number of prizes (represented as individual NFTs) ranked by their rarity
- (when launched) swap a user-provided lootbox for a randomly-chosen prize NFT
  - adapted to the lootbox level (see above for guarantees), and
  - provably fair

Let's start from the last one - "provably fair".

## Verifiable Randomness

In web2, you have to trust the operators of a lottery that the outcome was fairly determined, but in web3 - and on Algorand specifically - we can do better than that. After all, trustless execution is a big part of the appeal of blockchain.

In this case, we wanted to be able to come up with a system that could be proven to be fair. I hold a few lootboxes myself, so the challenge is to make a system that I can not game, even if I both developed _and_ operated it.

We accomplished this by utilizing [Verifiable Randomness](https://developer.algorand.org/articles/randomness-on-algorand/?from_query=verifiable%20randomness).

#### Wait a sec 

You can not generate instant randomness on the Algorand blockchain - or any blockchain, to the extent of my knowledge. In an instant-randomness blockchain world, if someone has a lootbox (which I do) and runs a node (which I do) they could choose to submit the transactions only when it is favorable to them, which would break the system.

Instead you have to commit to a future value. The [Algorand Randomness Beacon](https://developer.algorand.org/articles/usage-and-best-practices-for-randomness-beacon/) was developed by the Foundation with [Applied Blockchain](https://appliedblockchain.com/). To use it properly, you need to transact in two stages.

First, you commit to using the result of the Beacon contract at a future block. Then, after that block has elapsed, you can read the random value from the beacon smart contract. The beacon's value is guaranteed to be immune from compromise even from its operators, as the beacon contract will accept the random value ("proof") only if:

- 1/ The correct private key was used to create it, and
- 2/ the correct thing was signed

This value is submitted to the Beacon contract by an off-chain service, and happens every 8 rounds. The "correct thing being signed" in the beacon's case is the seed of an Algorand block, which can't be arbitrarily chosen by anyone, nor is it known ahead of time. If the right key is used but the wrong value is signed, the beacon smart contract will reject it.


#### A bit faster please

If we rely on the Algorand Randomness Beacon, the worst-case scenario wait-time for randomness works out to be 11 rounds*, which is about 36 seconds with the current version of the Algorand protocol.

_* 7 to get to the next block that randomness will be published for, another 2 for the off-chain service to publish, another 2 for our transaction to go through._

That is OK, and I relied on this method for the execution of the [CupStakes](https://cupstakes.world) draws, but in this case I wanted to see if we can do better than that.

#### What's in a beacon?

The essence of the Randomness beacon is a smart contract that uses the `vrf_verify` [opcode](https://developer.algorand.org/docs/get-details/dapps/avm/teal/opcodes/#vrf_verify) to verify that the value submitted to it (by the off-chain service) matches the expected signature of the pre-agreed-upon value (block seed for round N.)

All of these components were available to us, so we opted to use the exact same approach as the VRF beacon, except operated by ourselves, and on-demand. The extra effort to do this means we can have fixed-time reveals of exactly 4 blocks. The reveal process is:

- At round 1000, the user sends their lootbox. We commit to execute based on the block seed of round 1000 + 2 = 1002
- At round 1002 (+6.6 sec), our off-chain service reads the block seed, creates a VRF signature (or "proof") with a specific key that the Reveal contract expects.
- At round 1004 (+13.2 sec), our backend can call the reveal contract to execute the reveal. The VRF signature is submitted, verified by the contract & the prize selection is made according to it.

This approach is:

- fair: we can't influence the outcome, as we cannot predict a future block seed
- predictably fast: our users will know the outcome of their reveal in 13.2 seconds

The potential danger of this approach is the off-chain service failing to submit the reveal transaction. For this reason we have two different operators (myself and EXA) running two completely independent backends that watch the chain and execute reveals when they are spotted.

#### What if it fails anyway?

I am confident that the redundant backends will execute the reveals on-time, but still, when designing a smart contract you need to account for all eventualities. One of those is that all backends were offline for a long enough time that the block seed was "forgotten" by the network (from a smart contract, you can only see the block seed of the past 1000 blocks or so.)

For this unlikely scenario, reveals can be rescheduled if they expire: if a reveal was scheduled for more than 1000 rounds before the current round, then it can't be executed, so it is rescheduled for 2 rounds in the future.

This, however, would leave open an attack vector if there is a solo operator of this service with stake in the game. If, say, I exclusively operated those backends, I could calculate the outcome for my own lootboxes when the reveal rounds were reached, and then just choose not to submit the reveal, wait for it to expire, and reschedule it - rinse and repeat until I win the top prize. This was another factor in deciding to run the backends from two different operators - both myself and EXA.

## Dynamic prize pool

A challenge in dealing with randomness on-chain (and generally) is ensuring that you are not introducing bias when mapping your uniform randomness to your choice space.

Let's assume for the sake of this example that the randomness value we get is between 0 and 7.

If our number of choices is a power of two, we can just take the remainder of the division (randomness/total_choices). With 4 possible choices, this would look like:

```
Randomness -> choice
0 -> 0
1 -> 1
2 -> 2
3 -> 3
4 -> 0
5 -> 1
6 -> 2
7 -> 3
```

This works great! We did not introduce any bias - each choice is equally likely.

What if we have 6 choices to make, though?

```
Randomness -> choice
0 -> 0
1 -> 1
2 -> 2
3 -> 3
4 -> 4
5 -> 5
6 -> 0
7 -> 1
```

Here we are producing twice as many 0s and 1s as the other choices, so while the input randomness was uniform, the output is skewed to favor outcomes 0 and 1.

#### In real life

On-chain, the randomness we get is 32 bytes, which is a number between 0 and 2{{<sup>}}256{{</sup>}}-1. There are a few different ways to accomplish mapping this to an arbitrary space, but a fairly simple one is to take "chunks" out of the randomness and keep trying to fit it into your choice space. If it doesn't fit, keep taking chunks until one does.

So if we had to make a choice out of 200 choices, we would take a byte-sized chunk{{<sup>}}heh{{</sup>}} and see if it falls within 0-199. If yes, that is our result. If not, take the next byte and try again. As a byte is 256 possible values, each "chunk" has a 78% chance of fitting in to 0-199. This approach can fail if the number is just-right (/wrong), but in this example the odds of that are 0.0000000000000000000755% - and with our actual lootbox numbers it is similarly unlikely that it will happen.

I modeled this approach in Javascript, tested it (tens of millions of samples), then wrote it in pyTEAL. Both the individual function that produces this, and the reveal contract overall, were extensively tested to ensure that the averages are in the expected ranges.

For L2 and L3 lootboxes, the choice is made across the entire prize pool space, and then divided by 4 or 16 respectively.

## Large prize pool

The final bit of complexity had to do with the number of prizes.  The exact number was not known during the initial phases of development, but it was estimated to be in the thousands. The actual number of prizes after the merging phase was concluded was 4,015. On an Algorand smart contract, this leaves box storage as the only viable option to store the prize pool.

Even after optimizing a bit (by using 4 bytes to store each asset ID instead of the normal 8) - that still gives us a prize pool box size of 16KB. While boxes can be up to 32KB in total size, things are generally constrained when operating with large boxes: a single transaction cannot read a box that large, so you need multiple to increase your "budget".

Another delightful (but reasonable) surprise is that the maximum length of a byte sequence you can store in memory on the AVM is 4KB. So if you need to remove a prize from the start of a 16KB box, you need to put some elbow grease in it.

As Boxes are fairly new, there are no data structures that I am aware of that can utilize them, so you have to write your own. The prize pool is stored as a list of 4015 concatenated uint32 values, and the operations to push to this list, or splice it, had to be coded with care (especially considering the aforementioned 4KB limitation.)

## Wrapping up

All in all, this engagement was really interesting and even challenging at times. I am satisfied with the results so far & hope that the reveal phase - which is due to start within the hour after this article is published - will go smoothly for all users.

And who knows - we may be seeing more of this VRF shuffle method beyond the lootbox reveals.

----

The reveal contract ID is [1177117711](https://algoexplorer.io/application/1177117711) on Mainnet.

For any questions you can hit me up on [Twitter](https://twitter.com/d13_co) or by [Email](mailto:bit@d13.co).
