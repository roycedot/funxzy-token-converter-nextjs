const FUN_API_KEY = process.env.FUN_API_KEY;
const USDC_SYMBOL = "USDC";
const ETH_SYMBOL = "ETH";
const USDT_SYMBOL = "USDT";
const WBTC_SYMBOL = "WBTC";

// these chain ids were provided in the assignment PDF
export const TOKEN_SYMBOL_TO_CHAIN_ID: { [key: string]: string } = {
  [USDC_SYMBOL]: "1",
  [ETH_SYMBOL]: "8453",
  [USDT_SYMBOL]: "137",
  [WBTC_SYMBOL]: "1",
};
