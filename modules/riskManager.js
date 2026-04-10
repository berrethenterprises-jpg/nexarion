function getMaxTrades(capital) {
  return Math.max(1, Math.floor((capital / 200) * 2));
}

module.exports = { getMaxTrades };