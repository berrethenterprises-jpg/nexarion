const { Connection } = require("@solana/web3.js");

const RPC = "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC);

// 🔥 QUEUE SYSTEM
const queue = [];
let processing = false;

// 🔥 HARD RATE LIMIT
let requestsThisMinute = 0;
setInterval(() => {
  requestsThisMinute = 0;
}, 60000);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// 🔥 GLOBAL RATE LIMITER
let lastCall = 0;
async function rateLimit() {
  const now = Date.now();
  const diff = now - lastCall;

  if (diff < 800) {
    await sleep(800 - diff);
  }

  lastCall = Date.now();
}

async function processQueue() {
  if (processing) return;
  processing = true;

  while (queue.length > 0) {
    const { signature, resolve } = queue.shift();

    try {
      // 🔥 HARD LIMIT PROTECTION
      if (requestsThisMinute > 20) {
        resolve(null);
        continue;
      }

      requestsThisMinute++;

      await rateLimit();

      const tx = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0
      });

      if (!tx) {
        resolve(null);
        continue;
      }

      const instructions = tx.transaction.message.instructions;

      let found = null;

      for (let ix of instructions) {
        if (!ix.parsed) continue;

        if (ix.parsed.type === "transfer") {
          const token = ix.parsed.info?.mint;
          if (!token) continue;

          found = {
            token,
            side: "buy"
          };
          break;
        }
      }

      resolve(found);

    } catch (err) {
      // 🔥 FAIL SAFE
      resolve(null);
    }

    // 🔥 EXTRA THROTTLE
    await sleep(800);
  }

  processing = false;
}

function parseTrade(signature) {
  return new Promise((resolve) => {
    queue.push({ signature, resolve });
    processQueue();
  });
}

module.exports = { parseTrade };