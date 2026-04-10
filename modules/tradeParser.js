const axios = require("axios");

// 🔥 BASIC PARSER USING SIGNATURE (FREE METHOD)
async function parseTrade(signature) {
  try {
    // NOTE: free infra limitation — simplified approach

    const res = await axios.get(
      `https://api.dexscreener.com/latest/dex/search?q=${signature}`
    );

    const pair = res.data.pairs?.[0];
    if (!pair) return null;

    return {
      token: pair.baseToken.address,
      side: "buy"
    };

  } catch (err) {
    return null;
  }
}

module.exports = { parseTrade };