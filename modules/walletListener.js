const { Connection, PublicKey } = require("@solana/web3.js");

const RPC = "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC);

const listeners = new Map();

function listenToWallet(address, onTrade) {
  if (listeners.has(address)) return;

  const pubkey = new PublicKey(address);

  const sub = connection.onLogs(pubkey, (logInfo) => {
    try {
      const logs = logInfo.logs.join(" ");

      // Detect swap keywords
      if (
        logs.includes("swap") ||
        logs.includes("Swap") ||
        logs.includes("raydium")
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