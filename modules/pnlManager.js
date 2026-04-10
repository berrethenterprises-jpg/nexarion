let totalPnL = 0;
let lossStreak = 0;

function recordTrade(entry, exit, size) {
  const pnl = (exit - entry) * size;
  totalPnL += pnl;

  if (pnl < 0) lossStreak++;
  else lossStreak = 0;

  return pnl;
}

function getLossStreak() {
  return lossStreak;
}

module.exports = { recordTrade, getLossStreak };