const { recordTrade } = require("./pnlManager");
const { closePosition } = require("./positionManager");
const { setCooldown } = require("./cooldownManager");

function shouldExit(pos, price) {
  const profit = (price - pos.entryPrice) / pos.entryPrice;

  // 🔥 TEST MODE (FASTER EXITS)
  if (profit > 0.02) return true;   // +2%
  if (profit < -0.02) return true;  // -2%

  return false;
}

async function handleExit(token, pos, market, onClose) {
  if (!shouldExit(pos, market.price)) return false;

  const pnl = recordTrade(pos.entryPrice, market.price, pos.size);

  closePosition(token);
  setCooldown(token);

  if (onClose) onClose();

  console.log("[EXIT]", token, "PnL:", pnl.toFixed(2));

  return true;
}

module.exports = { handleExit };