function isValidToken(token) {
  if (!token) return false;

  // 🔥 basic filters (expand later)
  if (token.length < 30) return false;

  return true;
}

module.exports = { isValidToken };