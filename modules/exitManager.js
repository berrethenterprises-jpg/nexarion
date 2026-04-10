const { recordTrade } = require("./pnlManager");
const { closePosition } = require("./positionManager");

function shouldExit(pos, price) {
  const profit = (price - pos.entryPrice) / pos.entryPrice;

  if (profit > 0.5) return true;
  if (profit < -0.2) return true;

  return false;
}

async function handleExit(token, pos, market) {
  if (!shouldExit(pos, market.price)) return;

  const pnl = recordTrade(pos.entryPrice, market.price, pos.size);
  closePosition(token);

  console.log("EXIT:", token, "PnL:", pnl.toFixed(2));
}

module.exports = { handleExit };