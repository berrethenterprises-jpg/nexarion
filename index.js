const logger = require("./utils/logger");

const { executeSwap } = require("./modules/executionEngine");
const { getMarketData } = require("./modules/marketData");

const {
  openPosition,
  updatePosition,
  hasPosition,
  getPositions
} = require("./modules/positionManager");

const { handleExit } = require("./modules/exitManager");
const { getMaxTrades } = require("./modules/riskManager");
const { isOnCooldown } = require("./modules/cooldownManager");

const { listenToWallet } = require("./modules/walletListener");
const { getWallets } = require("./modules/walletManager");
const { parseTrade } = require("./modules/tradeParser");
const { isValidToken } = require("./modules/tokenFilter");

let capital = 1000;
let activeTrades = 0;

// 🔥 HANDLE WALLET TRADE
async function handleWalletTrade(event) {
  const parsed = await parseTrade(event.signature);

  if (!parsed || parsed.side !== "buy") return;

  const token = parsed.token;

  if (!isValidToken(token)) return;
  if (hasPosition(token)) return;
  if (isOnCooldown(token)) return;

  const market = await getMarketData(token);
  if (!market) return;

  const size = capital * 0.02;

  const success = await executeSwap("SOL", token, size);
  if (!success) return;

  openPosition(token, size, market.price);
  activeTrades++;

  logger.info("COPY BUY:", token);
}

// 🔥 MONITOR POSITIONS
async function monitorPositions() {
  while (true) {
    const positions = getPositions();

    for (let [token, pos] of positions.entries()) {
      const market = await getMarketData(token);
      if (!market) continue;

      updatePosition(token, market.price);

      await handleExit(token, pos, market, () => {
        activeTrades--;
      });
    }

    await sleep(2000);
  }
}

// 🔥 START LISTENERS
function startListeners() {
  const wallets = getWallets();

  wallets.forEach(wallet => {
    listenToWallet(wallet, handleWalletTrade);
    logger.info("Listening:", wallet);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function start() {
  logger.info("NEXARION v4.0 COPY TRADING LIVE");

  startListeners();
  monitorPositions();
}

start();