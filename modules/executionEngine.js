const { PAPER_TRADING } = require("./config");

async function executeSwap(input, output, amount) {
  if (PAPER_TRADING) {
    return true;
  }

  try {
    // Future Jupiter integration goes here
    return true;
  } catch (err) {
    console.log("[ERROR] Swap failed", err.message);
    return false;
  }
}

module.exports = { executeSwap };