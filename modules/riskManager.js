function getMaxTrades(capital) {
  return Math.floor((capital / 200) * 2);
}

module.exports = { getMaxTrades };