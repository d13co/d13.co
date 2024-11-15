const address = "4PLEASE4MINE4ORANGES4RESPONSIBLY4444444444444444444YE3NQSI";
const indexerApi = "https://mainnet-idx.algonode.cloud";
const endpoint = `/v2/transactions?address=${address}&address-role=receiver&limit=5000`;
setInterval(() => refresh, 5 * 60 * 1000);
async function refresh() {
  try {
    const resp = await fetch(`${indexerApi}${endpoint}`);
    const { transactions } = await resp.json();
    transactions.reverse();
    const signers = {};
    for(const txn of transactions) {
      try {
        const note = atob(txn.note);
        if (/please mine oranges responsibly/i.test(note)) {
          signers[txn.sender] = txn.id;
        }
      } catch(e) {
        console.error(`While processing ${txn.id}: ${e}`);
      }
    }
    //
    const addrs = Object.keys(signers);
    const nfds = await lookupNFD(addrs);
    window.signers = signers;
    window.nfds = nfds;
    showall(20);
  } catch(e) {
    console.error(e);
  }
}
function showall(limit=0) {
  const contentList = document.getElementById('subsigners-list');
  contentList.innerHTML = '';
  const status = document.getElementById('status');
  status.innerHTML = '';
  let i=0;
  let j=0;
  for(const [signer, id] of Object.entries(signers)) {
    j++
    const div = document.createElement('div');
    const displaySender = nfds[signer] ?? signer.slice(0, 8) + "..";
    div.innerHTML = `<a href="https://allo.info/tx/${id}">${displaySender}</a>`
    if ( (limit && i < limit && nfds[signer]) ||
      (!limit)) {
      i++
      contentList.appendChild(div);
    }
    if (limit && i >= limit) {
      break;
    }
  }
  if (limit && ((j != i) || (Object.keys(signers).length > limit))) {
    contentList.innerHTML += `<div class="cx-space-between"><span>(NFDs shown first)</span><button className="btn" onclick="showall()">Show all</button><span class="cx-invisi">(NFDs shown first)</span></div>`;
  }
}
refresh();
function chunk(elems, num=20) {
  return elems.reduce((out, cur) => {
    let last = out[out.length - 1];
    if (last.length == num) {
      out.push([]);
      last = out[out.length -1];
    }
    last.push(cur);
    return out;
  }, [[]]);
}
const NFDCache = {};
async function lookupNFD(addresses) {
  addresses = Array.isArray(addresses) ? addresses : [addresses];
  const New = []
  for(const address of addresses) {
    if (NFDCache[address] === undefined) {
      New.push(address);
    }
  }
  if (New.length) {
    const asyncRes = _lookupNFD(New);
    for(const N of New) {
      NFDCache[N] = asyncRes.then((data) => {
        return data[N];
      });
    }
  }
  const resultsE = Object.entries(NFDCache).filter(([key]) => addresses.includes(key));
  const results = {};
  for(const [resKey, resValue] of resultsE) {
    NFDCache[resKey] = results[resKey] = await resValue;
  }
  return results;
}
async function _lookupNFD(address) {
  let addresses = Array.isArray(address) ? address : [address];
  const results = Object.fromEntries(addresses.map(address => ([address, null])));
  const chunks = chunk(addresses, 20);
  await Promise.all(chunks.map(async chunk => {
    if (!chunk.length)
      return;
    const query = chunk.join('&address=');
    const url = `https://api.nf.domains/nfd/lookup?address=${query}&view=thumbnail`;
    let text;
    try {
      const resp = await fetch(url);
      text = await resp.text();
      let json;
      if (!text.length) {
        return;
      }
      json = JSON.parse(text);
      for(const [addr, obj] of Object.entries(json)) {
        const { name } = obj;
        results[addr] = name;
      }
    } catch(e) {
      console.log('NFDomains lookup', e, text);
      return;
    }
  }));
  return results;
}

function sign() {
  const manualVote = `<div>Send 0 ALGO and the note <code>Please mine oranges responsibly</code> to:</div>
    <div> <code>${address}</code> </div>
     <details>
  <summary>A NOTE?! IsN't ThAt wAsTeFuLlL?! 😱</summary>
  <p>As mentioned above, using the chain is not a problem. When your application scales to 3-digit GB is where you may want to consider efficiencies.</p>
</details>
    `;
  const signContainer = document.getElementById('subsign-sign');
  signContainer.classList.add('open');
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.open(`algorand://${address}?amount=1&xnote=Please mine oranges responsibly`);
    signContainer.innerHTML = `<div>Opening your mobile wallet...</div>
    <div>If this does not work, you can vote manually:</div>
    ${manualVote}
`;
  } else {
    signContainer.innerHTML = `<div>Scan this QR code with Pera or Defly to vote</div>
      <img src="qr.png" class="ssqr"/>
    </div>
    <div>Alternatively:</div>
    ${manualVote}
`;
  }
}
