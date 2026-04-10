const cooldowns = new Map();

const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutes

function isOnCooldown(token) {
  const last = cooldowns.get(token);
  if (!last) return false;

  return Date.now() - last < COOLDOWN_TIME;
}

function setCooldown(token) {
  cooldowns.set(token, Date.now());
}

module.exports = {
  isOnCooldown,
  setCooldown
};