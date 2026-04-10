const { recordTrade } = require("./pnlManager");
const { closePosition } = require("./positionManager");
const { setCooldown } = require("./cooldownManager");

// 🔥 Track entry time
function shouldExit(pos) {
  const now = Date.now();

  // Exit after 10 seconds (FOR TESTING)
  if (!pos.entryTime) return false;

  return now - pos.entryTime > 10000;
}

async function handleExit(token, pos, market, onClose) {
  if (!shouldExit(pos)) return false;

  const pnl = recordTrade(pos.entryPrice, market.price, pos.size);

  closePosition(token);
  setCooldown(token);

  if (onClose) onClose();

  console.log("[EXIT]", token, "PnL:", pnl.toFixed(6));

  return true;
}

module.exports = { handleExit };