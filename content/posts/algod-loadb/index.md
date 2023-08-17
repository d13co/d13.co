---
title: "Algod-Loadb: An aware Algod HTTP Load Balancer"
date: 2022-04-25T02:18:38+00:00
slug: algod-loadb-an-aware-algod-http-load-balancer
url: /algod-loadb-an-aware-algod-http-load-balancer
cover:
  image: algod-loadb.png
---

So you want to do High Availability Algorand stuff. But algod, your
trusty portal to and from the Algorand blockchain, can betray you in a
number of ways:

-   It can go down for upgrades. algod must be up to date to keep
    syncing. It is recommended to set up a cron job to attempt to update
    algod every day. This will usually include some downtime ~we\ think~
-   It can go down for not upgrading. We had a (non-production) algod
    which got stuck on a particular block. After looking into it, it was
    a couple of versions old, and after a pre-agreed-upon round, it just
    stopped syncing. Updating was quickish - the update script worked
    great, but it did require some time to migrate/rebuid some index
    files to the latest version.
-   It can get stuck, or be left behind, because software is hard,
    complicated and unpredictable in fascinating ways.


We are building a bunch of stuff on Algorand, and one of them definitely
requires H/A - the [AlgoFi Borrow Utilization Monitoring
Service](https://d13.co/algofi-borrow-utilization-monitoring-service).
This puppy will keep track of every AlgoFi account\'s utilization
percentage, as well as the AlgoFi oracle lending prices, in order to
calculate borrow utilization and notify users when theirs exceeds
whatever threshold they have specified. We want this done at every
single block, 24/7/365, guaranteed.

**2023 update: This particular service never materialized due to lack of user interest & size of market.**

We want our algods to stay up to date, but we also don\'t want to have
to upgrade manually, and we definitely don\'t want rotten vegetables
thrown at us by angry users who were liquidated while our service was
unavailable due to technical reasons.

We looked around for a load balancer for algod but didn\'t find any.
What a great excuse to write one!

Our load balancer is called algod-loadb. It load balances HTTP calls to
algod, supporting the [v2
endpoints](https://developer.algorand.org/docs/rest-apis/algod/v2/),
and has so far worked with every client we have thrown at it, like
(javascript) algosdk, js-algofi-lend-sdk, and so on. It supports msgpack
formats as well as JSON. We have successfully posted transactions
through it to the blockchain.

How work?
---------

We configure the load balancer with a number of backend algods. When it
starts up, it polls each backend for its status, from which it gets the
current round. It then keeps polling
`/v2/status/wait-for-block-after/${last_round}` to be notified when that
algod steps forward into the next round.

When an HTTP request comes in, it gets the \"synced\" backends (that are
on the latest round known to the load balancer) and picks one at random
to route to. This means that if an algod goes down, or gets stuck on a
round, it will take at most 4.5s to be taken out of circulation.

It is also aware of archival nodes vs normal nodes, as the former have
the full chain from round zero, and the latter only keep around the last
1000 blocks, so if a request comes in for `/v2/blocks/1024`, it knows to
route the request to an archival backend, if there is one connected. If
not, it will just route to a synced node at random so that the error
message is the expected one from algod.

The only `/v2/` route we have re-implemented is
`/v2/wait-for-block-after/x`. We have tried to match the algod behaviour
as closely as possible (down to the error message thrown if the round
number provided is not valid). Our implementation of this endpoint will
return the status when the first available backend reaches the desired
round number. Why mess with perfection and reimplement this endpoint?
Well, if we left it unchanged and routed it to a synced backend, that
backend could crash or become stale, and the client application would
never know something went wrong. But with its strategic placement,
algod-loadb can improve the outcome of this scenario and transparently
ignore the backend that becomes stale, always giving up to date
information to clients asking for the `wait-for-block-after` endpoint.

Some other nice-to-have we included:

-   Graceful shutdown: it waits for currently pending requests to finish
    before shutting down (up to a configurable number of seconds)
-   Graceful startup: The client-facing HTTP server is usually up first,
    before algod-loadb knows the state of the backends. Any requests
    that come in bright and early during this period are put on a queue
    and served as soon as we have a backend ready.

Some guiding principles we aspired to:

-   Don\'t break the contract. When we reimplement an algod route (just
    the one we mentioned above, so far) we do our best to be as algod as
    possible. With an algod mustache and that algod haircut.
-   Always route requests to a synced backend. If we just round-robined
    available backends without keeping their last-round into account, we
    could return \"block X is ready\" from a backend that is slightly
    ahead, and then route a request for `/v2/blocks/x` to a
    slightly-behind backend that tells the user \"failed to retrieve
    information from the ledger\", a.k.a. \"I don\'t have that block\".
    No bueno.
-   Don\'t always route to a synced backend: The exception to the above
    is the `/v2/blocks/x` route, which for small enough values of `x`
    (more than 1000 rounds behind current round) will be routed
    primarily based on the archival-ness of backends, rather than their
    sync-ness.

What we get out of using it:

-   High availability even during algod upgrades
-   Protection from algod nodes becoming stale
-   Higher performance (maybe) by splitting load into different algod
    backends

Drawbacks:

-   Written in JavaScript using express. If performance becomes a
    consideration we can look into rewriting it with node-cluster so it
    can use more CPUs, but for our use cases it has been more than
    enough. If it becomes popular or we get funded for it, we will
    rewrite it in TypeScript for some added peace of mind.

It was genuinely fun writing algod-loadb.

Sound good? Would you have use for such a thing? If so, let us know and
push us towards open sourcing it.
