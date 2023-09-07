---
title: "Set Up Voi Participation Node on Ubuntu 22.04"
date: 2023-09-06T08:19:15+05:00
---

This article will guide you through setting up a Voi participation node on the latest Ubuntu LTS (22.04). It assumes you start with a local or remote (server/cloud) installation. Version 20.04 should also work, but is not tested extensively.

If you already have an Algorand node running, check back later for an upcoming article on co-hosting nodes.

{{< callout emoji="ℹ️" text="Code blocks can be copied for your convenience." >}}

## Check your version

Check that you are running Ubuntu. Run this command:

```bash
lsb_release -a
```

It should output a version of Ubuntu:

```text
No LSB modules are available.
Distributor ID:	Ubuntu
Description:	Ubuntu 22.04.3 LTS
Release:	22.04
Codename:	jammy
```

20.04 should also work.

## Update your software to the latest versions

Run:

```bash
sudo apt update && sudo apt-get upgrade -y && echo OK
```

Expected output:

```text
(many lines...)
? upgraded, ? newly installed, ? to remove and ? not upgraded.
OK
```

## Enable automatic software upgrades

Run this, which will keep your node software up to date:

```bash
sudo systemctl start unattended-upgrades && sudo systemctl enable unattended-upgrades
```

Expected output:

```text
Synchronizing state of unattended-upgrades.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable unattended-upgrades
```

## Install Algorand node software

### Set up repository

1. Run the following commands to download some requirements and add the algorand repository, from which you will be getting your node software and its updates:

```bash
sudo apt install -y jq gnupg2 curl software-properties-common
curl -o - https://releases.algorand.com/key.pub | sudo tee /etc/apt/trusted.gpg.d/algorand.asc
sudo add-apt-repository "deb [arch=amd64] https://releases.algorand.com/deb/ stable main"
```

You will see a long output that ends in this prompt:

```text
-----END PGP PUBLIC KEY BLOCK-----
Repository: 'deb [arch=amd64] https://releases.algorand.com/deb/ stable main'
Description:
Archive for codename: stable components: main
More info: https://releases.algorand.com/deb/
Adding repository.
Press [ENTER] to continue or Ctrl-c to cancel.
```

2. As the prompt indicates, press `ENTER` to continue.

### Install the node

1. Run this command to install the node:

```bash
sudo apt update && sudo apt install -y algorand && echo OK
```

Expected output will be similar to this:

```text
The following NEW packages will be installed:
  algorand
0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.
Need to get 0 B/108 MB of archives.
After this operation, 0 B of additional disk space will be used.
Selecting previously unselected package algorand.
(Reading database ... 33854 files and directories currently installed.)
Preparing to unpack .../algorand_3.17.0_amd64.deb ...
Unpacking algorand (3.17.0) ...
Setting up algorand (3.17.0) ...
Created symlink /etc/systemd/system/multi-user.target.wants/algorand.service → /lib/systemd/system/algorand.service.
OK
```

### Stop the node

By default, the algorand node will auto-start, which we do not want. Stop it with:

```bash
sudo systemctl stop algorand && sudo systemctl disable algorand && echo OK
```

Expected output: `OK`

## Set up your shell to run goal

Run this command to help `goal` run properly on your shell:

```bash
echo -e "\nexport ALGORAND_DATA=/var/lib/algorand/" >> ~/.bashrc && source ~/.bashrc && echo OK
```

## Set up your user

```bash
sudo adduser $(whoami) algorand && echo OK
```

Expected last line of output: `OK`

## Configure your node for voi

1. Run these commands:

```bash
sudo algocfg set -p DNSBootstrapID -v "<network>.voi.network" -d /var/lib/algorand/ &&\
sudo algocfg set -p GossipFanout -v 8 -d /var/lib/algorand/ &&\
sudo algocfg set -p EnableCatchupFromArchiveServers -v true -d /var/lib/algorand/ &&\
sudo chown algorand:algorand /var/lib/algorand/config.json &&\
sudo chmod g+w /var/lib/algorand/config.json &&\
echo OK
```

Expected output: `OK`

2. Run this command to fetch the genesis file:

```bash
sudo curl -s -o /var/lib/algorand/genesis.json https://testnet-api.voi.nodly.io/genesis &&\
sudo chown algorand:algorand /var/lib/algorand/genesis.json &&\
echo OK
```

Expected output: `OK`

3. Rename the algorand service to voi:

```bash
sudo cp /lib/systemd/system/algorand.service /etc/systemd/system/voi.service &&\
sudo sed -i 's/Algorand daemon/Voi daemon/g' /etc/systemd/system/voi.service &&\
echo OK
```

Expected output: `OK`

### Start your node

Time to start your node! Run this command to start your Voi node & configure it to restart automatically after a reboot:

```bash
sudo systemctl start voi && sudo systemctl enable voi && echo OK
```

Expected last line of output: `OK`

## Check your status

Check the status of your node with the following command:

```bash
goal node status
```

Expected output should look like this:

```text
Last committed block: 7
Time since last block: 1.0s
Sync Time: 3.5s
Last consensus protocol: https://github.com/algorandfoundation/specs/tree/abd3d4823c6f77349fc04c3af7b1e99fe4df699f
Next consensus protocol: https://github.com/algorandfoundation/specs/tree/abd3d4823c6f77349fc04c3af7b1e99fe4df699f
Round for next consensus protocol: 8
Next consensus protocol supported: true
Last Catchpoint:
Genesis ID: voitest-v1
Genesis hash: IXnoWtviVVJW5LGivNFc0Dq14V3kqaXuK2u5OQrdVZo=
```

It is important to check the Genesis ID and hash lines match:

`Genesis ID: voitest-v1`

and

`Genesis hash: IXnoWtviVVJW5LGivNFc0Dq14V3kqaXuK2u5OQrdVZo=`

## Fast catch up with the network

Run the following command:

```bash
goal node catchup $(curl -s https://testnet-api.voi.nodly.io/v2/status|jq -r '.["last-catchpoint"]') &&\
echo OK
```

Expected last line of output: `OK`

### Check the node's status

Check status with this command:

```bash
goal node status
```

There should now be several "Catchpoint: ..." lines, like so:

```text
Last committed block: 33069
Sync Time: 181.3s
Catchpoint: 30000#33ABPU3KRJEQIX4NCTMK4CSBNXWDXSN36X47OHDKJEVW7MPSK3ZA
Catchpoint total accounts: 33
Catchpoint accounts processed: 33
Catchpoint accounts verified: 33
Catchpoint total KVs: 0
Catchpoint KVs processed: 0
Catchpoint KVs verified: 0
Catchpoint total blocks: 1321
Catchpoint downloaded blocks: 796
Genesis ID: voitest-v1
Genesis hash: IXnoWtviVVJW5LGivNFc0Dq14V3kqaXuK2u5OQrdVZo=
```

If this does not happen, start over from the start of this section ("Fast catchup with the network") or seek help on the [Voi Discord](https://discord.gg/ZjAc4rSkgq).

If it does, it means that your node is processing a fast catchup to the latest state, which can save a lot of time.

### Wait for fast catchup to complete

Run this command and wait until the "Catchpoint" lines disappear:

```bash
goal node status -w 1000
```

When the checkpoint lines disappear, wait for "Sync Time" to be `0.0s`

After this you can exit the status command with `Ctrl+C`. You are now all synced up!

# Participation

This part of the guide will walk you through adding an address via mnemonic to your node, generating participation keys and going online.

## Create a node wallet

Run this command to create a wallet that will store your mnemonic in encrypted form:

```bash
goal wallet new voi
```

You will be prompted to enter a password. Choose something secure & save it on paper or in a secure assword manager.

Expected output:

```text
Please choose a password for wallet 'voi':
Please confirm the password:
Creating wallet...
Created wallet 'voi'
Your new wallet has a backup phrase that can be used for recovery.
Keeping this backup phrase safe is extremely important.
Would you like to see it now? (Y/n):
```

You will then be prompted to view your backup seed phrase. Press `Y` and `ENTER` to view it. Save it somewhere securely.

## Add your participating address mnemonic

Run:

```bash
goal account import
```

Enter your wallet password that you created above when prompted, then type or paste the mnemonic seed of the Voi account that you want to participate with. Press `ENTER` to import.

```text
Please enter the password for wallet 'voi':
Please type your recovery mnemonic below, and hit return when you are done:
apple apple apple apple ...
```

It should output `Imported [YOUR ADDRESS]`

## Generate your participation keys

Run this set of commands to generate the participation keys for your account.

It will prompt for:

1) your Voi address (that you entered above) and 
2) the participation duration, defaulting to 2M rounds (77 days at 3.3 second rounds.) Press ENTER to accept that. 

```bash
echo -ne "\nEnter your voi address: " && read addr &&\
echo -ne "\nEnter duration in rounds [press ENTER to accept default (2M)]: " && read duration &&\
start=$(goal node status | grep "Last committed block:" | cut -d\  -f4) &&\
duration=${duration:-2000000} &&\
end=$((start + duration)) &&\
dilution=$(echo "sqrt($end - $start)" | bc) &&\
goal account addpartkey -a $addr --roundFirstValid $start --roundLastValid $end --keyDilution $dilution
```

After entering your information, it will print `Please stand by while generating keys. This might take a few minutes...`

After a few minutes, you should see:

```text
Participation key generation successful. Participation ID: CJOZKSLXZUNEPPOFLRU7JPISOPRVMBJASP2EIFP6CKIKJTAIEMNA
Generated with goal v3.17.0
```

## Register to go online

{{< callout emoji="⚠️" text="**Whenever you intend to take your node offline, make sure to register offline first** (next section). Being registered to participate without a node running actively harms the network." >}}

1. Check that you are not registered online:

```bash
if [ "$addr" == "" ]; then echo -ne "\nEnter your voi address: " && read addr; else echo ""; fi
goal account dump -a $addr | jq -r 'if (.onl == 1) then "You are online!" else "You are offline." end'
```

Expected output: `You are offline.`

2. You can register your account as participating in the Voi consensus with the following command: 

```bash
if [ "$addr" == "" ]; then echo -ne "\nEnter your voi address: " && read addr; else echo ""; fi
goal account changeonlinestatus -o=1 -a $addr
goal account dump -a $addr | jq -r 'if (.onl == 1) then "You are online!" else "You are offline." end'
```

You will see a prompt for your wallet password. After you enter it, you should see the following:

```text
Please enter the password for wallet 'voi': 
Transaction id for status change transaction: 5KYUOGQYKTVPN5RBFFKDNMYUIQZY5RK5VQIMEDZDE2FPIB32M3OA
Transaction 5KYUOGQYKTVPN5RBFFKDNMYUIQZY5RK5VQIMEDZDE2FPIB32M3OA still pending as of round 34820
Transaction 5KYUOGQYKTVPN5RBFFKDNMYUIQZY5RK5VQIMEDZDE2FPIB32M3OA still pending as of round 34821
Transaction 5KYUOGQYKTVPN5RBFFKDNMYUIQZY5RK5VQIMEDZDE2FPIB32M3OA committed in round 34822
You are online!
```

## Register to go offline

If you need to stop your participation node, you must register your account as offline.

This can be done with the following:

1. First check that you are registered online:

```bash
if [ "$addr" == "" ]; then echo -ne "\nEnter your voi address: " && read addr; else echo ""; fi
goal account dump -a $addr | jq -r 'if (.onl == 1) then "You are online!" else "You are offline." end'
```

Expected output: `You are online!`

2. Send a transaction to mark your account as offline:

```bash
if [ "$addr" == "" ]; then echo -ne "\nEnter your voi address: " && read addr; else echo ""; fi
goal account changeonlinestatus -a $addr -o=0
sleep 1
goal account dump -a $addr | jq -r 'if (.onl == 1) then "You are online!" else "You are offline." end'
```

You will see a prompt for your wallet password. After you enter it, you should see the following:

```text
Please enter the password for wallet 'voi': 
Transaction id for status change transaction: 5KYUOGQYKTVPN5RBFFKDNMYUIQZY5RK5VQIMEDZDE2FPIB32M3OA
Transaction 5KYUOGQYKTVPN5RBFFKDNMYUIQZY5RK5VQIMEDZDE2FPIB32M3OA still pending as of round 34820
Transaction 5KYUOGQYKTVPN5RBFFKDNMYUIQZY5RK5VQIMEDZDE2FPIB32M3OA still pending as of round 34821
Transaction 5KYUOGQYKTVPN5RBFFKDNMYUIQZY5RK5VQIMEDZDE2FPIB32M3OA committed in round 34822
You are offline.
```

# Fin

That is it for now. Stay tuned for updates to this guide via the [Voi Discord](https://discord.gg/ZjAc4rSkgq).
