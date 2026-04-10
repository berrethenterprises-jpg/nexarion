const { recordTrade } = require("./pnlManager");
const { closePosition } = require("./positionManager");
const { setCooldown } = require("./cooldownManager");

function shouldExit(pos, price) {
  const profit = (price - pos.entryPrice) / pos.entryPrice;

  // 🔥 REAL LOGIC
  if (profit > 0.25) return true;   // take profit +25%
  if (profit < -0.15) return true;  // stop loss -15%

  return false;
}

async function handleExit(token, pos, market, onClose) {
  if (!shouldExit(pos, market.price)) return false;

  const pnl = recordTrade(pos.entryPrice, market.price, pos.size);

  closePosition(token);
  setCooldown(token);

  if (onClose) onClose();

  console.log("[EXIT]", token, "PnL:", pnl.toFixed(6));

  return true;
}

module.exports = { handleExit };