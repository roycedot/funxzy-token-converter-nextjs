"use client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Progress } from "@heroui/progress";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { useState } from "react";

import { TOKEN_SYMBOL_TO_CHAIN_ID, FUN_API_KEY } from "./constants";

import { subtitle } from "@/components/primitives";
import { readTokenUnitPrice } from "@/app/funxyz_api";

export default function Home() {
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
      const unitPrice = await readTokenUnitPrice(tokenId);

      if (unitPrice) {
        // TODO: use custom type
        // TODO: use spread syntax + prevState instead
        const newExchangeRateTable: { [key: string]: { [key: string]: Date | number } } = Object.assign(
          {},
          exchangeRateTable,
        );

        newExchangeRateTable[tokenId] = {
          unitPrice,
          lastUpdDateTime: new Date(),
        };
        setExchangeRateTable(newExchangeRateTable);
      } else {
        // alert error getting unit price
      }

      const newLoadingTokenIds = new Set(loadingTokenIds);

      newLoadingTokenIds.delete(tokenId);
      setLoadingTokenIds(newLoadingTokenIds);
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

  function formatDateTime(date: Date): string {
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
              <TableColumn>XRATE LAST UPDATED</TableColumn>
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
                      <TableCell>{convertFromUSDTo(tokenExchangeRateInfo?.unitPrice)}</TableCell>
                      <TableCell>{tokenExchangeRateInfo?.unitPrice}</TableCell>
                      <TableCell>{formatDateTime(tokenExchangeRateInfo?.lastUpdDateTime)}</TableCell>
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
