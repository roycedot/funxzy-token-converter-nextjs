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
      const responseJSON = await res.json();

      if (responseJSON?.error) {
        onError(tokenId, responseJSON?.error);

        return null;
      }

      // data has tokenAddress
      exchangeRateTable[tokenId] = exchangeRateInfo = responseJSON;
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
    const responseJSON = await res.json();

    if (responseJSON?.error) {
      onError(tokenId, responseJSON?.error);

      return null;
    }

    return responseJSON?.unitPrice;
  } catch (e) {
    // TODO possibly better parse the error message from Fun
    onError(tokenId, "Error fetching token unit price. Please try again.");
  }

  return null;
};
