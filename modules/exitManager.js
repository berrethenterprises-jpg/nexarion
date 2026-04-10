const { recordTrade } = require("./pnlManager");
const { closePosition } = require("./positionManager");
const { setCooldown } = require("./cooldownManager");

function shouldExit(pos, price) {
  const profit = (price - pos.entryPrice) / pos.entryPrice;

  // 🔥 FORCE QUICK EXIT FOR TESTING
  if (profit > 0.001) return true;   // +0.1%
  if (profit < -0.001) return true;  // -0.1%

  return false;
}

async function handleExit(token, pos, market, onClose) {
  if (!shouldExit(pos, market.price)) return false;

  const pnl = recordTrade(pos.entryPrice, market.price, pos.size);

  closePosition(token);
  setCooldown(token);

  if (onClose) onClose();

  console.log("[EXIT]", token, "PnL:", pnl.toFixed(4));

  return true;
}

module.exports = { handleExit };