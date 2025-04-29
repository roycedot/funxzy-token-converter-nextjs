/** helper module to access Fun.xyz API through our own API Routes */
export const readTokenUnitPrice = async (
  tokenId: string,
  exchangeRateTable: {
    // TODO: define type
    [key: string]: { [key: string]: Date | number };
  },
  onError: (tokenId: string, errorMsg: string) => void,
): Promise<number | null> => {
  let exchangeRateInfo = exchangeRateTable[tokenId];

  // first we need the address of the token - use that to lookup unitPrice
  if (!exchangeRateInfo) {
    const url =
      "/api/fun/token_address?" +
      new URLSearchParams({
        tokenId,
      }).toString();
    const res = await fetch(url);

    try {
      // data has tokenAddress
      exchangeRateInfo = await res.json();
      exchangeRateTable[tokenId] = exchangeRateInfo;
    } catch (e) {
      // TODO possibly better parse the error message from Fun
      onError(tokenId, "Error fetching token address. Please try again.");

      return null;
    }
  }

  const url =
    "/api/fun/token_price_info?" +
    new URLSearchParams({
      tokenId,
      tokenAddress: exchangeRateInfo.tokenAddress,
    }).toString();
  const res = await fetch(url);

  try {
    const data = await res.json();

    return data?.unitPrice;
  } catch (e) {
    // TODO possibly better parse the error message from Fun
    onError(tokenId, "Error fetching token unit price. Please try again.");
  }

  return null;
};
