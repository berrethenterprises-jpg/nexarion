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

const WATCHLIST = [
  "Es9vMFrzaCERmJfrF4HnXrhTbk4P8GHWxirMRHkRkNv",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkYv6t9y8"
];

async function processTrades() {
  while (true) {

    if (activeTrades >= getMaxTrades(capital)) {
      await sleep(500);
      continue;
    }

    for (let token of WATCHLIST) {

      // 🔥 CRITICAL FIXES
      if (hasPosition(token)) continue;
      if (isOnCooldown(token)) continue;

      const market = await getMarketData(token);
      if (!market) continue;

      if (market.priceChange > 0.2) continue;

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
        activeTrades--; // 🔥 FIXED
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
  logger.info("NEXARION v3.2 FIXED LIVE");

  processTrades();
  monitorPositions();
}

start();