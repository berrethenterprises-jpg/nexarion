const positions = new Map();

function openPosition(token, size, entryPrice) {
  positions.set(token, {
    size,
    entryPrice,
    peak: entryPrice,
    entryTime: Date.now() // 🔥 REQUIRED
  });
}

function updatePosition(token, price) {
  const pos = positions.get(token);
  if (!pos) return;

  if (price > pos.peak) {
    pos.peak = price;
  }
}

function closePosition(token) {
  positions.delete(token);
}

function hasPosition(token) {
  return positions.has(token);
}

function getPositions() {
  return positions;
}

module.exports = {
  openPosition,
  updatePosition,
  closePosition,
  hasPosition,
  getPositions
};