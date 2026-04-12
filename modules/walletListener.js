const { Connection, PublicKey } = require("@solana/web3.js");

const RPC = "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC);

const listeners = new Map();

// 🔥 Sampling counter (GLOBAL)
let counter = 0;

function listenToWallet(address, onTrade) {
  if (listeners.has(address)) return;

  const pubkey = new PublicKey(address);

  const sub = connection.onLogs(pubkey, (logInfo) => {
    try {
      if (!logInfo.signature) return;

      // 🔥 SAMPLE ONLY 1 IN 5 EVENTS
      counter++;
      if (counter % 5 !== 0) return;

      // 🔥 FILTER LOW-QUALITY LOGS
      if (!logInfo.logs || logInfo.logs.length < 5) return;

      const logs = logInfo.logs.join(" ");

      // 🔥 ONLY LIKELY SWAP EVENTS
      if (
        logs.includes("swap") ||
        logs.includes("Swap") ||
        logs.includes("raydium") ||
        logs.includes("orca")
      ) {
        onTrade({
          wallet: address,
          signature: logInfo.signature
        });
      }

    } catch (err) {}
  });

  listeners.set(address, sub);
}

module.exports = { listenToWallet };