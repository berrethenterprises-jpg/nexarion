const axios = require("axios");

const cache = new Map();

async function getMarketData(token) {
  const cached = cache.get(token);
  if (cached && Date.now() - cached.time < 3000) return cached.data;

  try {
    const res = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${token}`
    );

    const pair = res.data.pairs?.[0];
    if (!pair) return null;

    const data = {
      price: parseFloat(pair.priceUsd),
      liquidity: pair.liquidity.usd,
      priceChange: pair.priceChange.h1
    };

    cache.set(token, { data, time: Date.now() });
    return data;
  } catch {
    return null;
  }
}

module.exports = { getMarketData };