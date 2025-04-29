// import { FUN_API_KEY } from "./constants";
//
// const readTokenAddress = async (tokenSymbol: string): Promise<string | null> => {
//   // if (!FUN_API_KEY) {
//   if (true) {
//     return "FUN_API_KEY environment variable needs to be set on server.";
//   }
//
//   return null;
// };
//
// const readTokenPriceInfo = async (tokenSymbol: string): Promise<string | null> => {
//   // if (!FUN_API_KEY) {
//   if (true) {
//     return "FUN_API_KEY environment variable needs to be set on server.";
//   }
//
//   return null;
// };

export const readTokenUnitPrice = async (tokenSymbol: string): Promise<number | null> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return 244;
};
