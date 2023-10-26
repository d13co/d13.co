---
title: "Set Up Voi Participation Node on Ubuntu 22.04"
date: 2023-09-06T08:19:15+05:00
cover:
  image: voi.png
ShowToc: true
TocOpen: true
ShowReadingTime: true
---

This article will guide you through setting up a Voi participation node on the latest Ubuntu LTS (22.04). It assumes you start with a local or remote (server/cloud) installation. Version 20.04 should also work, but is not tested extensively. This guide is only suitable for `x86` architecture machines as it relies on the Algorand repository, which does not publish packages for other architectures such as ARM64.

If you already have an Algorand node running, check back later for an upcoming article on co-hosting nodes.

{{< details "🪙 &nbsp;You will need to have some $VOI balance to complete this guide." >}}

You will need $VOI because:

- Transacting on the VOI network requires a small fee (0.001 $VOI)
- Participating in consensus is proportional to your balance

The last step of this guide includes "going online", i.e. registering to participate in consensus. This is an on-chain transaction that costs 0.001 $VOI.

If you do not have $VOI yet, you can still complete all steps until that point while you wait to get some $VOI.

You can get 1 VOI to participate by running the command `/voi-testnet-faucet` on `#node-runners` on the [Voi Discord](#join-the-node-runners-channel).

{{</ details >}}

{{< callout emoji="ℹ️" text="Code blocks can be copied for your convenience." >}}



## Hardware Requirements

You will need the following specs for your participation node:

- CPU with 8 **threads** (4 core / 8 thread is fine)
- 16 GB RAM
- 100 GB NVMe SSD or equivalent
- 100 Mbps connection minimum 
  - Ideally: 1 Gbps connection with low latency
  - Must be always online



## Check your Ubuntu version

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


## Check your architecture

Check that you are on an `x86` machine. Run this command:

```
uname -p
```

Expected output: `x86_64`.

If you get a different response (such as `aarch64` for ARM64) then this guide will not work as-is due to ARM packages of Algorand not being available through the repository that this guide uses.


{{< details "⚡ If you are technically savvy and on a non-x86 machine..." >}}

You can start with [Step 5 of the Algorand/Oracle guide](https://d13.co/set up algorand participation node on oracle cloud free/#step 5 install algod) to install algod and then resume from the [set up your shell to run goal](#set up your shell to run goal) part **but you will need to modify the commands**:

- replacing `/var/lib/algorand` with `/home/ubuntu/node/data` everywhere
  - assuming your user is `ubuntu`. Check this with the command `whoami`.
- run: `sudo apt install -y jq`
- run: `echo 'export PATH=$PATH:/home/ubuntu/node' >> ~/.bashrc && source ~/.bashrc`
- skip the "Set up your user" command: `sudo adduser $(whoami) algorand && echo OK`
- skip the "Rename the algorand service to voi" part
- skip the `sudo chown algorand:algorand` commands
- skip the `sudo chmod g+w /var/lib/algorand/config.json` command
- the `systemctl` commands need to be modified, instead of `systemctl start voi` you will need `systemctl start algorand@-home-ubuntu-node-data`
- remove `sudo` **except for `systemctl` commands**

{{< /details >}}

## Update your software to the latest versions

Run:

```bash
sudo apt update && export DEBIAN_FRONTEND=noninteractive && sudo apt-get upgrade -y && echo OK
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
sudo apt install -y jq bc gnupg2 curl software-properties-common
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

## Stop the node

By default, the algorand node will auto-start, which we do not want. Stop it with:

```bash
sudo systemctl stop algorand && sudo systemctl disable algorand && echo OK
```

Expected output: `OK`



### Set up your shell to run goal

Run this command to help `goal` run properly on your shell:

```bash
echo -e "\nexport ALGORAND_DATA=/var/lib/algorand/" >> ~/.bashrc && source ~/.bashrc && echo OK
```



### Set up your user

```bash
sudo adduser $(whoami) algorand && echo OK
```

Expected last line of output: `OK`



## Configure your node for voi

1. Run these commands:

```bash
sudo algocfg set -p DNSBootstrapID -v "<network>.voi.network" -d /var/lib/algorand/ &&\
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



### Check your status

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



### Fast catch up with the network

Run the following command:

```bash
goal node catchup $(curl -s https://testnet-api.voi.nodly.io/v2/status|jq -r '.["last-catchpoint"]') &&\
echo OK
```

Expected last line of output: `OK`

{{< details "❗ Error? " >}}

If you encounter an error in this step, check the error carefully. If it includes `already catching up` towards the end, then everything is OK and you can proceed to the next step. 

---

If you get an error that includes `unable to start catchpoint service for requested catchpoint` then try restarting the voi service and attempt to catch up again.

To restart the service use:

```bash
sudo systemctl restart voi && echo OK
```

Expected output: `OK`.

Then you should retry the catchup command. If you try the restart-catchup a few times and if it still doesn't work, reach out on the [Discord](#join-the-node-runners-channel).

{{< /details >}}

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

If this does not happen, start over from the start of this section ("Fast catchup with the network") or seek help on the [Voi Discord](#join-the-node-runners-channel).

If it does, it means that your node is processing a fast catchup to the latest state, which can save a lot of time.

#### Wait for fast catchup to complete

Run this command and wait until the "Catchpoint" lines disappear:

```bash
goal node status -w 1000
```

When the checkpoint lines disappear, wait for "Sync Time" to be `0.0s`

After this you can exit the status command with `Ctrl+C`. You are now all synced up!



### [Optional] Enable Telemetry

You can optionally enable node telemetry which will report stats and errors in order to detect issues and improve the blockchain.

{{< callout emoji="ℹ️" text="**The initial node runners seed/airdrop will depend on telemetry data**. If you want to receive it, you need to enable telemetry. Beyond that, block rewards will _not_ depend on telemetry being enabled." >}}

The following command will attach a friendly name to your telemetry. Replace "XXX" with your desired name, something like your NFD or nickname.

```bash
sudo ALGORAND_DATA=/var/lib/algorand diagcfg telemetry name -n XXX
```

Then you can enable telemetry and restart the voi service with this command:

```bash
sudo ALGORAND_DATA=/var/lib/algorand diagcfg telemetry enable &&\
sudo systemctl restart voi
```

You can check if the telemetry is working correctly by checking the `Node Health` section of the [Monitoring](#monitoring) web interface.

{{< details "🧠 Pro tip: Reduced logging interferes with telemetry" >}}
If you have manually disabled or reduced logging on your node, telemetry will not work.

Your `config.json` must have `BaseLoggerDebugLevel` set to `4` (or not set at all.)

If you are following this guide without modifications, you can ignore this tip.
{{< /details >}}


## Join the node runners channel

To access the `#node-runners` channel on the Voi Discord, you need to:

1) [Join the server and visit the #roles](https://discord.gg/hSDwR7Avsm) channel.
2) Emote with a running emoji 🏃 to the message there.
3) You should be able to access the [#node-runners](https://discord.gg/ZjAc4rSkgq) channel.

You can get 1 VOI to participate by running the command `/voi-testnet-faucet` in the `#node-runners` channel.

## Participation

This part of the guide will walk you through adding an address via mnemonic to your node, generating participation keys and going online.



### Create a node wallet container

The current recommendation is to use your node to sign transactions that will take your account online (participating) or offline (not participating.)

For this you will need to create an encrypted container ("wallet") that is secured by a password. **Your seed phrase(s) will be encrypted with this password, so pick something long and unpredictable.** In the event that your node is compromised, this password will be all that stands between the attacker and your seed phrases.

You will need to enter this password whenever you need to sign transactions on your node.

{{< details "🧠 Pro tip: How to generate a random 12 character password on your node" >}}

You can generate a random 12 character password on your node with this command:

```
tr -dc A-Z0-9 </dev/urandom | head -c 12 ; echo ''
```

You can then use this password in the next step.

Make sure to save this either on paper or in a password manager.

{{< /details >}}

When you have decided on a very strong password, run this command to create the encrypted wallet container:

```bash
goal wallet new voi
```

You will be prompted to enter a password. Note the warnings above and enter one.

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



### Create or import your participating address

In this step you can import your Voi account mnemonic on your node. You can either create a new account, or import an existing one.

{{< callout emoji="⚠️" text="**We strongly recommend creating a new account for Voi.** If you use an account that exists on Algorand, a potential compromise would affect you on both networks." >}}

Choose your preferred method and expand it to view the instructions. You only need to do one of these.

{{< details "**To create a new account, expand this section.**" >}}

#### Step 1

You can create a new account in the container you just created with the following command:

```
goal account new
```

You will be prompted for your wallet container password that you created earlier.

Expected output: 

```
Please enter the password for wallet 'voi':
Created new account with address AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

Copy the newly created address, as we will use it in the next step.

---

#### Step 2

To display your new account's mnemonic, use this command:

```
echo -ne "\nEnter your voi address: " && read addr &&\
goal account export -a $addr
```

It will prompt you for 1) the address generated in step 1, and 2) the password you created earlier. Expected output: 

`Enter your voi address:`

`Please enter the password for wallet 'voi':`

`Exported key for account AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA: "crystal sing shy patient toddler lady crouch frown salmon toilet token educate leader comic ignore harvest strike holiday twist pulse better result beyond absorb come"`

Save this mnemonic securely. A paper backup or a password manager are good options.

Great! You can now proceed to [generating your participation keys](#generate-your-participation-keys)

{{< /details >}}

{{<details "**To import an existing account using its mnemonic, expand this section.**" >}}
Run this command:

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
{{< /details >}}



### Generate your participation keys

Run this set of commands to generate the participation keys for your account.

It will prompt for:

1) your Voi address (in some cases) and
2) the participation duration, defaulting to 2000000 rounds (77 days at 3.3 second rounds.) Press ENTER to accept that. 

```bash
{{< getaddress >}}getaddress &&\
echo -ne "\nEnter duration in rounds [press ENTER to accept default)]: " && read duration &&\
start=$(goal node status | grep "Last committed block:" | cut -d\  -f4) &&\
duration=${duration:-2000000} &&\
end=$((start + duration)) &&\
dilution=$(echo "sqrt($end - $start)" | bc) &&\
goal account addpartkey -a $addr --roundFirstValid $start --roundLastValid $end --keyDilution $dilution
```

{{< details "ℹ️  Error? Entered the wrong address?" >}}
If you see an error containing the words `value too great for base`, then you entered extra characters in the duration value.

Enter the number exactly without separators or suffixes like `M`, `K`, etc. Example: `2000000`

---

{{< wrongaddress >}}
{{< /details >}}

After entering your information, it will print `Please stand by while generating keys. This might take a few minutes...`

After a few minutes, you should see:

```text
Participation key generation successful. Participation ID: CJOZKSLXZUNEPPOFLRU7JPISOPRVMBJASP2EIFP6CKIKJTAIEMNA
Generated with goal v3.17.0
```

Your node is almost ready to register online and start participating in consensus. One more step to go!



### Check your participation status

Before and after performing key registration (online/offline) transactions, you may find it useful to check your account's participation status with this command:

```
{{< getaddress >}}getaddress &&\
goal account dump -a $addr | jq -r 'if (.onl == 1) then "You are online!" else "You are offline." end'
```

{{< details "ℹ️  Error? Entered the wrong address?" >}}
{{< wrongaddress >}}
{{< /details >}}


If you are online (participating in consensus) this should output `You are online!`. Otherwise, it will output `You are offline.`.



### Register to go online

{{< callout emoji="⚠️" text="**Whenever you intend to take your node offline, make sure to register offline first** (next section). Being registered to participate without a node running actively harms the network." >}}

{{< callout emoji="🪙" text="You will need some $VOI to complete this step. If you do not have any, reach out on the [Voi Discord](#join-the-node-runners-channel). You can check your balance on the [Explorer](https://voi.observer/)." >}}

1. Check that you are not registered online using the command in the [previous section](#check-your-participation-status). The output should be `You are offline.`.


2. You can register your account as participating in the Voi consensus with the following command: 


```bash
{{< getaddress >}}getaddress &&\
goal account changeonlinestatus -a $addr -o=1 &&\
sleep 1 &&\
goal account dump -a $addr | jq -r 'if (.onl == 1) then "You are online!" else "You are offline." end'
```

You will see a prompt for your address (unless you entered it earlier) and your wallet password. After you enter it, you should see the following:

```text
Please enter the password for wallet 'voi': 
Transaction id for status change transaction: 5KYUOGQYKTVPN5RBFFKDNMYUIQZY5RK5VQIMEDZDE2FPIB32M3OA
Transaction 5KYUOGQYKTVPN5RBFFKDNMYUIQZY5RK5VQIMEDZDE2FPIB32M3OA still pending as of round 34820
Transaction 5KYUOGQYKTVPN5RBFFKDNMYUIQZY5RK5VQIMEDZDE2FPIB32M3OA still pending as of round 34821
Transaction 5KYUOGQYKTVPN5RBFFKDNMYUIQZY5RK5VQIMEDZDE2FPIB32M3OA committed in round 34822
You are online!
```



### Register to go offline

If you need to stop your participation node, you must register your account as offline.

This can be done with the following:

1. Check that you are not registered online using the command in the [relevant section](#check-your-participation-status). The output should be `You are online!`.

2. Send a transaction to mark your account as offline:

```bash
{{< getaddress >}}getaddress &&\
goal account changeonlinestatus -a $addr -o=0 &&\
sleep 1 &&\
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



### Renew your participation keys

Your participation keys will expire at some point. The default values above (2 million round validity) currently correspond to 77 days. This section explains how to renew your participation keys.

You can renew your expired participation key with this command:

```bash
{{< getaddress >}}getaddress &&\
echo -ne "\nEnter duration in rounds [press ENTER to accept default)]: " && read duration &&\
start=$(goal node status | grep "Last committed block:" | cut -d\  -f4) &&\
duration=${duration:-2000000} &&\
end=$((start + duration)) &&\
dilution=$(echo "sqrt($end - $start)" | bc) &&\
goal account renewpartkey -a $addr --roundLastValid $end --keyDilution $dilution
```

It will:

- Prompt you for your address (unless you have entered it earlier)
- Prompt you for your desired participation key duration (just press enter to accept default - 2M / 77 days)
- It will generate the keys (which may take a few minutes)
- It will ask you for your wallet password, and 
- Submit the online transaction.

{{< details "❗ Possible Errors" >}}

`Account already has a participation key valid at least until roundLastValid`

This will happen if you try to renew your current participation key with one that expires sooner, e.g. i your current participation key expires in 1 million rounds, and your renewal is attempting to last until 500K rounds.

Select a larger duration value and this error should go away.

---

`roundLastValid needs to be well after the current round`

This happens if your duration is too short.

Select a larger duration value and this error should go away.

{{< /details >}}

Expected output: _(your values will differ)_

```text
Using address: WEAKNODEZXOBMGNQ56UIBFSGYHJLFPBTGQ7LJJYQFFYCZTDZ4AMRUYYFLU

Enter duration in rounds [press ENTER to accept default)]: 10000
Please stand by while generating keys. This might take a few minutes...
Participation key generation successful
Please enter the password for wallet 'voi':
Transaction id for status change transaction: TXDDH4VLD2N57Y4TAN4BSD5XUCYRUNIEBC6EL2ZZQHGTJSYGE25Q
Transaction TXDDH4VLD2N57Y4TAN4BSD5XUCYRUNIEBC6EL2ZZQHGTJSYGE25Q still pending as of round 482881
Transaction TXDDH4VLD2N57Y4TAN4BSD5XUCYRUNIEBC6EL2ZZQHGTJSYGE25Q still pending as of round 482882
Transaction TXDDH4VLD2N57Y4TAN4BSD5XUCYRUNIEBC6EL2ZZQHGTJSYGE25Q committed in round 482883
Participation key installed successfully, Participation ID: JX5GJ3ZYTJMXINMIOUNYKI6S37RPQ3JCQQR5XZ47QBPGWZPWWC5A

Generated with goal v3.18.0
```

You should now be online and participating in consensus! You can check this with the status command in the ["Check your participation status"](#check-your-participation-status) section.

## Monitoring

Community member Boeieruurd has set up a [monitoring interface](https://voi-node-info.boeieruurd.com/) here where you can see how your node is performing.

**It may take a while to have your participating address listed there** depending on your Voi balance.

Scores over 9 are very good. Scores under 5 are considered "failing".

## Fin

That is it for now. Stay tuned for updates to this guide via the [Voi Discord](#join-the-node-runners-channel).
