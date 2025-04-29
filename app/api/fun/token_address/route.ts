import { getAssetErc20ByChainAndSymbol } from "@funkit/api-base";
import { NextRequest } from "next/server";

import { FUN_API_KEY, TOKEN_SYMBOL_TO_CHAIN_ID } from "@/app/constants";

/**
 * This is essentially a proxy so the front-end can make a call to the Fun.xyz API
 * w/o any API key information being passed from the front.
 *
 * This "proxies" Fun's getAssetErc20ByChainAndSymbol() function
 *
 * @param request
 * @constructor
 */
export async function GET(request: NextRequest) {
  if (!FUN_API_KEY) {
    const data = {
      error: "FUN_API_KEY needs to be set on the server",
    };

    return Response.json(data, { status: 500 });
  }
  // @ts-ignore
  const { searchParams } = new URL(request.url);
  const tokenIdParam = searchParams.get("tokenId");

  if (!tokenIdParam) {
    const data = {
      error: "tokenId parameter is required",
    };

    return Response.json(data, { status: 422 });
  }
  let tokenId: string;

  if (Array.isArray(tokenIdParam)) {
    tokenId = tokenIdParam[0];
  } else {
    tokenId = tokenIdParam;
  }
  const chainId = TOKEN_SYMBOL_TO_CHAIN_ID[tokenId];

  if (!chainId) {
    const data = {
      error: "Unsupported tokenId value",
    };

    return Response.json(data, { status: 422 });
  }

  const tokenInfo = await getAssetErc20ByChainAndSymbol({
    chainId: chainId,
    symbol: tokenId,
    apiKey: FUN_API_KEY,
  });

  return Response.json({ tokenAddress: tokenInfo?.address });
}
