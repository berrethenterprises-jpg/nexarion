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

// 🔥 CORE STATE
let capital = 1000;
let activeTrades = 0;


// 🚀 HANDLE WALLET TRADES (COPY TRADING)
async function handleWalletTrade(event) {
  try {
    // 🔥 LIMIT MAX ACTIVE TRADES
    if (activeTrades >= getMaxTrades(capital)) return;

    const parsed = await parseTrade(event.signature);

    // 🔥 CRITICAL: SKIP BAD OR EMPTY DATA
    if (!parsed || parsed.side !== "buy") return;

    const token = parsed.token;

    // 🔥 SAFETY FILTERS
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

  } catch (err) {
    console.log("[ERROR] handleWalletTrade:", err.message);
  }
}


// 🚀 MONITOR OPEN POSITIONS (EXIT LOGIC)
async function monitorPositions() {
  while (true) {
    try {
      const positions = getPositions();

      for (let [token, pos] of positions.entries()) {
        const market = await getMarketData(token);
        if (!market) continue;

        updatePosition(token, market.price);

        const exited = await handleExit(token, pos, market, () => {
          activeTrades--; // 🔥 IMPORTANT FIX
        });

        if (exited) continue;
      }

    } catch (err) {
      console.log("[ERROR] monitorPositions:", err.message);
    }

    // 🔥 SLOW LOOP (REDUCES API LOAD MASSIVELY)
    await sleep(7000);
  }
}


// 🚀 START WALLET LISTENERS
function startListeners() {
  const wallets = getWallets();

  wallets.forEach(wallet => {
    try {
      listenToWallet(wallet, handleWalletTrade);
      logger.info("Listening:", wallet);
    } catch (err) {
      console.log("[ERROR] Listener failed:", wallet, err.message);
    }
  });
}


// 🔧 UTILITY
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// 🚀 MAIN START
function start() {
  logger.info("NEXARION v4.1 STABLE COPY TRADING LIVE");

  startListeners();
  monitorPositions();
}


// 🚀 RUN BOT
start();