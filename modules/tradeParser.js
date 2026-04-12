const { Connection } = require("@solana/web3.js");

const RPC = "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC);

async function parseTrade(signature) {
  try {
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });

    if (!tx) return null;

    const instructions = tx.transaction.message.instructions;

    for (let ix of instructions) {
      if (!ix.parsed) continue;

      // Look for token transfers
      if (ix.parsed.type === "transfer") {
        const token = ix.parsed.info?.mint;
        if (!token) continue;

        return {
          token,
          side: "buy"
        };
      }
    }

    return null;

  } catch (err) {
    return null;
  }
}

module.exports = { parseTrade };