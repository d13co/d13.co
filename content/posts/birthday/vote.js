// On-chain birthday poll. Votes are 0-ALGO transactions sent to VOTE_ADDRESS
// with an ARC-2 note: `d13bday:u<code>`. Latest vote per wallet wins.
// The indexer returns transactions newest-first and pages older via next-token.
const VOTE_ADDRESS = "OOOOOOOOOOLOOKATMEVOTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEC2SUAHY";
const indexerApi = "https://mainnet-idx.algonode.cloud";
const PAGE_LIMIT = 100; // txns fetched per page
const INITIAL_SHOWN = 10; // voters visible before first "show more"

const DAPP = "d13bday";
const NOTE_PREFIX = `${DAPP}:u`;
const OPTIONS = [
  { code: "11", label: "June 11th", faction: "Genesarian" },
  { code: "12", label: "June 12th", faction: "Duodecimalist Neverstallinist" },
  { code: "15", label: "June 15th", faction: "First Transactionism" },
  { code: "19", label: "June 19th", faction: "Dutchaversarist" },
  { code: "A", label: "Abstain", faction: "Didn't read, Don't care" },
];
const LABELS = Object.fromEntries(OPTIONS.map((o) => [o.code, o.label]));
const VALID_CODES = new Set(OPTIONS.map((o) => o.code));

let nextToken; // pagination cursor; undefined until first fetch
let exhausted = false; // true once there are no older pages
let loading = false;
const seenSenders = new Set();
const voters = []; // newest-first, one entry per wallet: {sender, code, id}
const nfdNames = {}; // address -> NFD name | null
let shown = INITIAL_SHOWN;

async function loadPage() {
  if (exhausted || loading) return;
  loading = true;
  try {
    let url = `${indexerApi}/v2/transactions?address=${VOTE_ADDRESS}&address-role=receiver&limit=${PAGE_LIMIT}`;
    if (nextToken) url += `&next=${encodeURIComponent(nextToken)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    const txns = data.transactions || [];
    for (const txn of txns) {
      try {
        if (!txn.note) continue;
        const note = atob(txn.note);
        if (!note.startsWith(NOTE_PREFIX)) continue;
        const code = note.slice(NOTE_PREFIX.length).trim();
        if (!VALID_CODES.has(code)) continue;
        if (seenSenders.has(txn.sender)) continue; // newest-first: keep latest vote
        seenSenders.add(txn.sender);
        voters.push({ sender: txn.sender, code, id: txn.id });
      } catch (e) {
        console.error(`While processing ${txn.id}: ${e}`);
      }
    }
    nextToken = data["next-token"];
    if (!nextToken || txns.length < PAGE_LIMIT) exhausted = true;
  } catch (e) {
    console.error(e);
  } finally {
    loading = false;
  }
}

async function resolveVisibleNFDs() {
  const addrs = voters
    .slice(0, shown)
    .map((v) => v.sender)
    .filter((a) => nfdNames[a] === undefined);
  if (!addrs.length) return;
  const res = await lookupNFD(addrs);
  for (const [a, name] of Object.entries(res)) nfdNames[a] = name ?? null;
}

function render() {
  renderResults();
  renderVoters();
}

function renderResults() {
  const counts = Object.fromEntries(OPTIONS.map((o) => [o.code, 0]));
  for (const v of voters) counts[v.code]++;
  const total = voters.length;

  const rows = OPTIONS.map((o) => {
    const count = counts[o.code];
    const pct = total ? (count / total) * 100 : 0;
    const pctText = total ? `${pct.toFixed(1)}%` : "0%";
    return `<div class="poll-row">
      <div class="poll-row-label">${o.label}</div>
      <div class="poll-bar"><div class="poll-bar-fill" style="width:${pct}%"></div></div>
      <div class="poll-row-count">${count} <span class="poll-row-pct">(${pctText})</span></div>
    </div>`;
  }).join("");

  const counted = `${total} vote${total === 1 ? "" : "s"} counted${exhausted ? "" : " so far"}`;
  document.getElementById("poll-results").innerHTML = `${rows}
    <div class="poll-total">${counted}</div>`;
}

function renderVoters() {
  const container = document.getElementById("poll-voters");
  if (!voters.length) {
    container.innerHTML = `<div class="poll-empty">No votes yet — be the first.</div>`;
    return;
  }
  const items = voters
    .slice(0, shown)
    .map((v) => {
      const name = nfdNames[v.sender] || v.sender.slice(0, 8) + "…";
      return `<div class="poll-voter"><a href="https://algo.surf/transaction/${v.id}">${name}</a><span class="poll-voter-choice">${LABELS[v.code]}</span></div>`;
    })
    .join("");
  const hasMore = voters.length > shown || !exhausted;
  const moreBtn = hasMore
    ? `<button class="poll-more" onclick="showMore()">Show more</button>`
    : "";
  container.innerHTML = items + moreBtn;
}

async function showMore() {
  // Reveal everything cached so far, then pre-load the next page.
  shown = voters.length;
  await resolveVisibleNFDs();
  render();
  await loadPage();
  await resolveVisibleNFDs();
  render();
}

async function init() {
  await loadPage();
  await resolveVisibleNFDs();
  render();
}
init();

function vote(code) {
  const note = `${NOTE_PREFIX}${code}`;
  const option = OPTIONS.find((o) => o.code === code);
  const uri = `algorand://${VOTE_ADDRESS}?amount=0&xnote=${encodeURIComponent(note)}`;

  const manual = `<div>Or send 0 ALGO with the note <code>${note}</code> to:</div>
    <div><code>${VOTE_ADDRESS}</code></div>`;

  // Keep the option buttons visible; just highlight the active choice.
  document
    .querySelectorAll("#poll-vote .poll-options button")
    .forEach((b) => b.classList.toggle("active", b.dataset.code === code));

  const action = document.getElementById("poll-action");
  action.classList.add("open");

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    action.innerHTML = `<div>Voting <strong>${option.label}</strong> &mdash; tap to open your wallet:</div>
      <a class="poll-wallet-btn" href="${uri}">Open wallet to vote</a>
      ${manual}`;
  } else {
    action.innerHTML = `<div>Voting <strong>${option.label}</strong> &mdash; scan this QR code with Pera or Defly:</div>
      <div id="poll-qr" class="poll-qr"></div>
      ${manual}`;
    new QRCode(document.getElementById("poll-qr"), {
      text: uri,
      width: 220,
      height: 220,
    });
  }
}

// --- CSV export: walk every page and emit all valid votes ---
async function exportCSV(event) {
  if (event) event.preventDefault();
  const link = document.getElementById("poll-export");
  if (link.dataset.busy === "1") return;
  link.dataset.busy = "1";
  link.textContent = "Downloading...";
  try {
    const rows = [];
    let token;
    do {
      let url = `${indexerApi}/v2/transactions?address=${VOTE_ADDRESS}&address-role=receiver&limit=${PAGE_LIMIT}`;
      if (token) url += `&next=${encodeURIComponent(token)}`;
      const resp = await fetch(url);
      const data = await resp.json();
      const txns = data.transactions || [];
      for (const txn of txns) {
        try {
          if (!txn.note) continue;
          const note = atob(txn.note);
          if (!note.startsWith(NOTE_PREFIX)) continue;
          const code = note.slice(NOTE_PREFIX.length).trim();
          if (!VALID_CODES.has(code)) continue;
          const ts = txn["round-time"];
          const when = ts ? new Date(ts * 1000).toISOString() : "";
          rows.push([txn.id, txn.sender, LABELS[code], when]);
        } catch (e) {
          console.error(`While exporting ${txn.id}: ${e}`);
        }
      }
      token = txns.length < PAGE_LIMIT ? undefined : data["next-token"];
    } while (token);
    const names = await lookupNFD(rows.map((r) => r[1]));
    for (const r of rows) r.push(names[r[1]] || "");
    downloadCSV(["Txn ID", "Voter", "Vote", "Date/Time", "NFD"], rows);
    link.textContent = "Download CSV";
  } catch (e) {
    console.error(e);
    link.textContent = "Export failed — retry";
  } finally {
    link.dataset.busy = "0";
  }
}

function csvField(value) {
  const s = String(value ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCSV(header, rows) {
  const lines = [header, ...rows].map((r) => r.map(csvField).join(","));
  const blob = new Blob([lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "d13-birthday-votes.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- NFD resolution (adapted from the Ora open-letter co-signer) ---
function chunk(elems, num = 20) {
  return elems.reduce(
    (out, cur) => {
      let last = out[out.length - 1];
      if (last.length == num) {
        out.push([]);
        last = out[out.length - 1];
      }
      last.push(cur);
      return out;
    },
    [[]]
  );
}
const NFDCache = {};
async function lookupNFD(addresses) {
  addresses = Array.isArray(addresses) ? addresses : [addresses];
  const New = [];
  for (const address of addresses) {
    if (NFDCache[address] === undefined) {
      New.push(address);
    }
  }
  if (New.length) {
    const asyncRes = _lookupNFD(New);
    for (const N of New) {
      NFDCache[N] = asyncRes.then((data) => data[N]);
    }
  }
  const resultsE = Object.entries(NFDCache).filter(([key]) =>
    addresses.includes(key)
  );
  const results = {};
  for (const [resKey, resValue] of resultsE) {
    NFDCache[resKey] = results[resKey] = await resValue;
  }
  return results;
}
async function _lookupNFD(address) {
  let addresses = Array.isArray(address) ? address : [address];
  const results = Object.fromEntries(addresses.map((address) => [address, null]));
  const chunks = chunk(addresses, 20);
  await Promise.all(
    chunks.map(async (chunk) => {
      if (!chunk.length) return;
      const query = chunk.join("&address=");
      const url = `https://api.nf.domains/nfd/lookup?address=${query}&view=thumbnail`;
      let text;
      try {
        const resp = await fetch(url);
        text = await resp.text();
        if (!text.length) return;
        const json = JSON.parse(text);
        for (const [addr, obj] of Object.entries(json)) {
          results[addr] = obj.name;
        }
      } catch (e) {
        console.log("NFDomains lookup", e, text);
        return;
      }
    })
  );
  return results;
}
