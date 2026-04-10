const logger = require("./utils/logger");

const { getMarketData } = require("./modules/marketData");
const { executeSwap } = require("./modules/executionEngine");

const {
  openPosition,
  updatePosition,
  getPositions
} = require("./modules/positionManager");

const { handleExit } = require("./modules/exitManager");
const { getMaxTrades } = require("./modules/riskManager");
const { getSeedWallets } = require("./modules/walletSeeder");
const { getLossStreak } = require("./modules/pnlManager");

let capital = 1000;
let activeTrades = 0;

const WATCHLIST = [
  "So11111111111111111111111111111111111111112" // test token
];

async function processTrades() {
  while (true) {

    if (activeTrades >= getMaxTrades(capital)) {
      await sleep(1000);
      continue;
    }

    for (let token of WATCHLIST) {

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
      await handleExit(token, pos, market);
    }

    await sleep(2000);
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function start() {
  logger.info("NEXARION v3.2 STARTED");

  processTrades();
  monitorPositions();
}

start();