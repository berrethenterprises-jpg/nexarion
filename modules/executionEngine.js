const { PAPER_TRADING } = require("./config");

async function executeSwap(input, output, amount) {
  if (PAPER_TRADING) {
    return true; // simulate success
  }

  // real Jupiter logic would go here later
  return true;
}

module.exports = { executeSwap };