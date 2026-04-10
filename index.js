const logger = require("./utils/logger");

const { getMarketData } = require("./modules/marketData");
const { executeSwap } = require("./modules/executionEngine");

const {
  openPosition,
  updatePosition,
  hasPosition,
  getPositions
} = require("./modules/positionManager");

const { handleExit } = require("./modules/exitManager");
const { getMaxTrades } = require("./modules/riskManager");
const { isOnCooldown } = require("./modules/cooldownManager");

let capital = 1000;
let activeTrades = 0;

// 🔥 UPDATED WATCHLIST (MORE ACTIVE TOKENS)
const WATCHLIST = [
  "So11111111111111111111111111111111111111112" // SOL
];

// 🔥 TEST MODE SETTINGS (TEMPORARY)
const MAX_PRICE_CHANGE = 5; // was 0.2 — loosened for testing

async function processTrades() {
  while (true) {

    if (activeTrades >= getMaxTrades(capital)) {
      await sleep(500);
      continue;
    }

    for (let token of WATCHLIST) {

      // ✅ FIX 1 — Prevent duplicate entries
      if (hasPosition(token)) continue;

      // ✅ FIX 2 — Cooldown enforcement
      if (isOnCooldown(token)) continue;

      const market = await getMarketData(token);
      if (!market) continue;

      // 🔥 RELAXED FILTER (FOR TESTING)
      if (market.priceChange > MAX_PRICE_CHANGE) continue;

      const size = capital * 0.02;

      const success = await executeSwap("SOL", token, size);
      if (!success) continue;

      openPosition(token, size, market.price);
      activeTrades++;

      logger.info("ENTER:", token, market.price);
    }

    await sleep(2000);
  }
}

async function monitorPositions() {
  while (true) {

    const positions = getPositions();

    for (let [token, pos] of positions.entries()) {

      const market = await getMarketData(token);
      if (!market) continue;

      updatePosition(token, market.price);

      const exited = await handleExit(token, pos, market, () => {
        activeTrades--; // ✅ FIXED PROPERLY
      });

      if (exited) continue;
    }

    await sleep(2000);
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function start() {
  logger.info("NEXARION v3.2 TEST MODE LIVE");

  processTrades();
  monitorPositions();
}

start();