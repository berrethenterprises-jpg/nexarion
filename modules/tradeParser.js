const { Connection } = require("@solana/web3.js");

const RPC = "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC);

// 🔥 queue system
const queue = [];
let processing = false;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function processQueue() {
  if (processing) return;
  processing = true;

  while (queue.length > 0) {
    const { signature, resolve } = queue.shift();

    try {
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
      // 🔥 retry once after delay
      await sleep(500);
      resolve(null);
    }

    // 🔥 throttle requests (KEY FIX)
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