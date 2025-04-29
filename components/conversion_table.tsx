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

export default function ConversionTable() {
  const [amountInUSD, setAmountInUSD] = useState<string>("1");
  const [selectedTokenIds, setSelectedTokenIds] = useState<Array<string>>(
    [],
  );
  const [loadingTokenIds, setLoadingTokenIds] = useState<Set<string>>(
    new Set<string>(),
  );
  const [exchangeRateTable, setExchangeRateTable] = useState<{
    // TODO: define type
    [key: string]: { [key: string]: Date | number };
  }>({});

  function onGetPriceInfoError(tokenId: string, error: string) {
    deselectTokenId(tokenId);
    clearTokenIsLoading(tokenId);
    alert(tokenId + ": " + error);
  }

  function deselectTokenId(tokenId: string) {
    const existingIdx = selectedTokenIds.indexOf(tokenId);

    if (existingIdx >= 0) {
      const newSelectedTokenIds = selectedTokenIds.slice();

      newSelectedTokenIds.splice(existingIdx, 1);
      setSelectedTokenIds(newSelectedTokenIds);
    }
  }

  function clearTokenIsLoading(tokenId: string) {
    const newLoadingTokenIds = new Set(loadingTokenIds);

    newLoadingTokenIds.delete(tokenId);
    setLoadingTokenIds(newLoadingTokenIds);
  }

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
        // TODO: use custom type
        // TODO: use spread syntax + prevState instead
        const newExchangeRateTable: { [key: string]: { [key: string]: Date | number } } = Object.assign(
          {},
          exchangeRateTable,
        );

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

  /**
   * Format a Date into a string of form YYYY-mm-DD HH:MM:SS
   * e.g. "2025-04-29 03:53:15"
   * @param date
   */
  function formatDateTime(date: Date | null): string {
    if (!date) {
      return "";
    }
    const intermediateString = date.toISOString().replace("T", " ");
    const periodIdx = intermediateString.indexOf(".");

    return intermediateString.substring(0, periodIdx);
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

                  // @ts-ignore
                  const converted = convertFromUSDTo(tokenExchangeRateInfo?.unitPrice)
                  // @ts-ignore
                  const unitPrice = tokenExchangeRateInfo?.unitPrice;
                  // @ts-ignore
                  const formattedLastUpdDateTimeStr = formatDateTime(tokenExchangeRateInfo?.lastUpdDateTime);

                  return (
                    <TableRow key={tokenId}>
                      <TableCell>{tokenId}</TableCell>
                      <TableCell>{converted}</TableCell>
                      <TableCell>{unitPrice?.toString()}</TableCell>
                      <TableCell>{formattedLastUpdDateTimeStr}</TableCell>
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
