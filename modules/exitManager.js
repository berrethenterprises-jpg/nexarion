const { recordTrade } = require("./pnlManager");
const { closePosition } = require("./positionManager");
const { setCooldown } = require("./cooldownManager");

function shouldExit(pos, price) {
  const profit = (price - pos.entryPrice) / pos.entryPrice;

  if (profit > 0.5) return true;   // take profit
  if (profit < -0.2) return true;  // stop loss

  return false;
}

async function handleExit(token, pos, market, onClose) {
  if (!shouldExit(pos, market.price)) return false;

  const pnl = recordTrade(pos.entryPrice, market.price, pos.size);

  closePosition(token);
  setCooldown(token);

  if (onClose) onClose(); // 🔥 decrement activeTrades

  console.log("[EXIT]", token, "PnL:", pnl.toFixed(2));

  return true;
}

module.exports = { handleExit };