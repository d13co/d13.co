---
title: "Redundant Participation Nodes on Algorand"
date: 2023-08-26T08:59:59+03:00
cover:
  image: 1693036862.png
---

Participating in Algorand consensus is finally getting the attention it deserves, with talks of incentivisation programmes both private and official. This article discusses participating in consensus through multiple nodes with the same participation keys.

## Consensus Rule #1: Always be participating.

Addresses that are "registered online", i.e. declared to be participating in Algorand consensus, are meant to always be online and participating in the consensus protocol. If enough online stake is delinquent, the chain be unable to reach consensus and stall.

As such, for large enough stake it is worth participating from two nodes at the same time. 

The upside to this is that you decrease the odds of your account failing to participate to ~zero, as this would require a concurrent failure of both nodes. For example, if you participated from both your home and a server, you would ensure that any residential connection hiccups would not affect your participation.

The downside to this is negligible from a network point of view. Your two nodes will be participating without knowledge of each other, both sending proposals and votes when your key is selected. One will always win out and the other's proposals (or votes) will be rejected as duplicates. This overhead is something that Algorand is designed to withstand, as the 2x chatter from your nodes in the name of high availability may just as well be a 10000x chatter in an intentional Denial of Service attempt.

Ultimately, if your stake is high enough, the tradeoff of this extra chatter for high availability participation is worth it.

## Process

Step 1: set up 2 algorand nodes and sync them up to the current state of the network.

Step 2: generate a participation key **to a file**.

Step 2: get the participation key file installed on your nodes.

## Step 1: Set up 2 nodes

Find a guide or method that works for you and follow it to completion, twice.

## Step 2: Generate a participation key \*file\*

The usual instructions for generating participation keys invoke the `goal account addpartkey` command. This command generates a participation key and installs it in your algod node, all in one go. It does not output the participation key to a file, nor is there a goal command to export your installed participation keys.

This is fine if you are going to be participating from a single node, but for redundant participation we need this key in multiple places, so we need another program that ships along with go-algorand: `algokey`. It will already be available on your algorand nodes.

```bash
# algokey part generate --help                                                            11:17:17
Generate participation key

Usage:
  algokey part generate [flags]

Flags:
      --dilution uint    Key dilution for two-level participation keys (defaults to sqrt of validity window)
      --first uint       First round for participation key
  -h, --help             help for generate
      --keyfile string   Participation key filename
      --last uint        Last round for participation key
      --parent string    Address of parent account
```

Algokey will generate a participation key and save it to a file (`--keyfile` option.) You fill in the relevant details as per usual and run it.

As an example:

`algokey part generate --first 31592905 --last 33892905 --dilution 1516 --parent DTHIRTEENNLSYGLSEXTXC6X4SVDWMFRCPAOAUCXWIXJRCVBWIIGLYARNQE --keyfile DTHIRTEENNLSYGLSEXTXC6X4SVDWMFRCPAOAUCXWIXJRCVBWIIGLYARNQE-31592905-33892905.partkey`

If you need a helper script to generate this command on a node, you can use [this script](https://gist.githubusercontent.com/d13co/1fe40467cfb8683a2e9fefab7771b719/raw/88ddd63ade1d03d42f81e5d24ba52529e6a44fb7/gen.sh) which takes an address and a duration in rounds, and outputs a ready-to-execute algokey command.


**1) Download it with:**

```bash
wget https://gist.githubusercontent.com/d13co/1fe40467cfb8683a2e9fefab7771b719/raw/88ddd63ade1d03d42f81e5d24ba52529e6a44fb7/gen.sh
```

**2) If needed, you can inspect it with:**

```bash
cat gen.sh
```

You will see that it performs some bland calculations and prints a command.

**3) To execute it, replace MY_ADDRESS and DURATION_IN_ROUNDS in the following command with your desired values:**

```bash
bash gen.sh  MY_ADDRESS  DURATION_IN_ROUNDS
```

It will output a bunch of parameters and at the end you will see an algokey command that you can copy-paste and execute.

After you do so, algokey will start generating the keys, which will be saved in the filename specified in the `--keyfile` argument of the command. Look for the file starting with your address and ending with `.partkey`. The numbers in the filename are the starting and ending validity rounds.

## Copy the participation key to your other node

Copy the participation key from the node that created it onto the node(s) that you need to install it. `scp` is usually your friend, but the specifics are left as an exercise to the reader.

## Install the participation key

After the participation key is on all nodes, you can install it with `goal account installpartkey`.

{{< callout emoji="⚠️" text="This command will delete the key file after installation" >}}

**1) Install the partkey file like this:**

```bash
goal account installpartkey --delete-input --partkey YOUR-KEY-FILENAME
```

If you get an error, check that the current user has write permissions on the keyfile (needed to delete it after installing it.)

If it succeeds, you will see something like:

`Participation key installed successfully, Participation ID: ABCDEF..`

**2) Confirm that the key is installed**

Check that the key is listed when you execute:

```
goal account partkeyinfo
```

Your address will be listed under the field "Parent address".

**3) Rinse and repeat on your other node(s).**

## Ready to go online

That was it for the installation part.

**Now issue a key registration transaction** and wait a couple hundreds rounds, and your nodes will be participating in Algorand consensus with high availability.

{{< callout emoji="✏️" text="If you need a tool to issue keyreg transactions without uploading your private (spending) keys to a node, [algotools.org](https://algotools.org/) has a \"participation key\" section that allows you to sign with Pera or Defly. Always doublecheck the parameters  on your wallet when signing." >}}

{{< callout emoji="ℹ️" text="If you are running a participation node, monitoring it with a free [Metrika.co account](https://app.metrika.co/algorand/alerts/subscriptions) is a must. They will email you if your account is not participating as expected." >}}



