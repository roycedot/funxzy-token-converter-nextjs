"use client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Progress } from "@heroui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { useState } from "react";

import { TOKEN_SYMBOL_TO_CHAIN_ID } from "@/app/constants";
import { subtitle } from "@/components/primitives";
import { readTokenUnitPrice } from "@/utils/funxyz_api";
import { ExchangeRateTableEntry } from "@/types";
import { formatDateTime } from "@/utils/date_utils";

export default function ConversionTable() {
  const [amountInUSD, setAmountInUSD] = useState<string>("1");
  const [selectedTokenIds, setSelectedTokenIds] = useState<Array<string>>(
    [],
  );
  const [loadingTokenIds, setLoadingTokenIds] = useState<Set<string>>(
    new Set<string>(),
  );
  const [exchangeRateTable, setExchangeRateTable] = useState<{
    [key: string]: ExchangeRateTableEntry;
  }>({});

  /**
   * Call-back to clear local state here when an API call errors out
   *
   * @param tokenId
   * @param error
   */
  function onGetPriceInfoError(tokenId: string, error: string) {
    deselectTokenId(tokenId);
    clearTokenIsLoading(tokenId);
    // using rudimentary alert - a nicer stylized alert would be betterin PROD
    alert(tokenId + ": " + error);
  }

  /**
   * Clear a token from the selections - used on API error callback
   * @param tokenId
   */
  function deselectTokenId(tokenId: string) {
    const existingIdx = selectedTokenIds.indexOf(tokenId);

    if (existingIdx >= 0) {
      const newSelectedTokenIds = selectedTokenIds.slice();

      newSelectedTokenIds.splice(existingIdx, 1);
      setSelectedTokenIds(newSelectedTokenIds);
    }
  }

  /**
   * Clear a token as "is loading" state - used on API error callback
   * @param tokenId
   */
  function clearTokenIsLoading(tokenId: string) {
    const newLoadingTokenIds = new Set(loadingTokenIds);

    newLoadingTokenIds.delete(tokenId);
    setLoadingTokenIds(newLoadingTokenIds);
  }

  /**
   * Callback when a token button is pressed, either
   * -selects the button/token and makes an API call OR
   * -deselects the button/token
   * @param tokenId
   */
  async function toggleCurrencySelected(tokenId: string) {
    const newSelectedTokenIds = selectedTokenIds.slice();
    const existingIdx = newSelectedTokenIds.indexOf(tokenId);

    let shouldLoadNewCurrency = false;

    if (existingIdx >= 0) {
      newSelectedTokenIds.splice(existingIdx, 1);
    } else if (newSelectedTokenIds.length > 1) {
      newSelectedTokenIds.shift();
      newSelectedTokenIds.push(tokenId);
      shouldLoadNewCurrency = true;
    } else {
      newSelectedTokenIds.push(tokenId);
      shouldLoadNewCurrency = true;
    }
    if (shouldLoadNewCurrency) {
      const newLoadingTokenIds = new Set(loadingTokenIds);

      newLoadingTokenIds.add(tokenId);
      setLoadingTokenIds(newLoadingTokenIds);
    }
    setSelectedTokenIds(newSelectedTokenIds);

    if (shouldLoadNewCurrency) {
      const unitPrice = await readTokenUnitPrice(
        tokenId,
        exchangeRateTable,
        onGetPriceInfoError,
      );

      if (unitPrice) {
        // TODO: use spread syntax + prevState instead
        const newExchangeRateTable: { [key: string]: ExchangeRateTableEntry } =
          Object.assign({}, exchangeRateTable);

        const existing = exchangeRateTable[tokenId];

        newExchangeRateTable[tokenId] = {
          unitPrice,
          lastUpdDateTime: new Date(),
        };
        if (existing?.tokenAddress) {
          // should always be true
          newExchangeRateTable[tokenId].tokenAddress = existing.tokenAddress;
        }
        setExchangeRateTable(newExchangeRateTable);
      } else {
        // alert error getting unit price
      }

      clearTokenIsLoading(tokenId);
    }
  }

  function onAmountInUSDChange(tokenId: string) {
    setAmountInUSD(tokenId);
  }

  function isLoadingTokenInfo(tokenId: string): boolean {
    return loadingTokenIds.has(tokenId);
  }

  function convertFromUSDTo(unitPrice: number | null): string {
    if (unitPrice) {
      return (parseFloat(amountInUSD) / unitPrice).toFixed(4).toString();
    }

    // shouldn't get here
    return "";
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <div className={subtitle({ class: "mt-4" })}>Token Price Explorer</div>
      </div>

      <div className="flex gap-3">
        <Input
          label="Amt in USD"
          type="number"
          value={amountInUSD}
          onChange={(e) => onAmountInUSDChange(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        {Object.keys(TOKEN_SYMBOL_TO_CHAIN_ID)
          .toSorted()
          .map((tokenId) => (
            <Button
              key={tokenId}
              color={
                selectedTokenIds.indexOf(tokenId) >= 0 ? "primary" : "default"
              }
              onPress={() => toggleCurrencySelected(tokenId)}
            >
              {tokenId}
            </Button>
          ))}
      </div>

      {selectedTokenIds.length > 0 && (
        <div className="flex gap-3">
          <Table aria-label="Example static collection table">
            <TableHeader>
              <TableColumn>CURRENCY</TableColumn>
              <TableColumn># TOKENS FOR USD</TableColumn>
              <TableColumn>UNIT PRICE (USD)</TableColumn>
              <TableColumn>XRATE LAST UPDATED (UTC)</TableColumn>
            </TableHeader>
            <TableBody>
              {selectedTokenIds.toSorted().map((tokenId) => {
                if (isLoadingTokenInfo(tokenId)) {
                  return (
                    <TableRow key={tokenId}>
                      <TableCell>{tokenId}</TableCell>
                      <TableCell colSpan={3}>
                        <Progress
                          isIndeterminate
                          aria-label={`Loading ${tokenId}...`}
                          className="max-w-sm"
                          size="sm"
                        />
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  const tokenExchangeRateInfo = exchangeRateTable[tokenId];

                  return (
                    <TableRow key={tokenId}>
                      <TableCell>{tokenId}</TableCell>
                      <TableCell>
                        {convertFromUSDTo(tokenExchangeRateInfo?.unitPrice)}
                      </TableCell>
                      <TableCell>{tokenExchangeRateInfo?.unitPrice}</TableCell>
                      <TableCell>
                        {formatDateTime(tokenExchangeRateInfo?.lastUpdDateTime)}
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
