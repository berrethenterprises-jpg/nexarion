const positions = new Map();

function openPosition(token, size, entryPrice) {
  positions.set(token, {
    size,
    entryPrice,
    peak: entryPrice
  });
}

function updatePosition(token, price) {
  const p = positions.get(token);
  if (!p) return;
  if (price > p.peak) p.peak = price;
}

function closePosition(token) {
  positions.delete(token);
}

function getPositions() {
  return positions;
}

module.exports = {
  openPosition,
  updatePosition,
  closePosition,
  getPositions
};