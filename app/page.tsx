"use client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { useState } from "react";

import { TOKEN_SYMBOL_TO_CHAIN_ID } from "./constants";

import { subtitle } from "@/components/primitives";

export default function Home() {
  const [amountInUSD, setAmountInUSD] = useState<string>("1");
  const [selectedCurrencies, setSelectedCurrencies] = useState<Array<string>>(
    [],
  );
  const [exchangeRateTable, setExchangeRateTable] = useState<{
    [key: string]: number;
  }>({
    ETH: 1500,
  });

  function toggleCurrencySelected(currency: string) {
    // console.log(currency);
    // alert('Currency:' + currency)
    const newSelectedCurrencies = selectedCurrencies.slice();
    const existingIdx = newSelectedCurrencies.indexOf(currency);

    if (existingIdx >= 0) {
      newSelectedCurrencies.splice(existingIdx, 1);
    } else if (newSelectedCurrencies.length > 1) {
      newSelectedCurrencies.shift();
      newSelectedCurrencies.push(currency);
    } else {
      newSelectedCurrencies.push(currency);
    }
    setSelectedCurrencies(newSelectedCurrencies);
  }

  function onAmountInUSDChange(currency: string) {
    setAmountInUSD(currency);
  }

  function convertFromUSDTo(currency: string): string {
    const unitPrice = exchangeRateTable[currency];

    if (unitPrice) {
      return (parseFloat(amountInUSD) / unitPrice).toFixed(4).toString();
    }

    return (parseFloat(amountInUSD) * 2).toFixed(4).toString();
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
                selectedCurrencies.indexOf(tokenId) >= 0 ? "primary" : "default"
              }
              onPress={() => toggleCurrencySelected(tokenId)}
            >
              {tokenId}
            </Button>
          ))}
      </div>

      {selectedCurrencies.length > 0 && (
        <div className="flex gap-3">
          <Table aria-label="Example static collection table">
            <TableHeader>
              <TableColumn>CURRENCY</TableColumn>
              <TableColumn>TOKENS FOR USD</TableColumn>
              <TableColumn>UNIT PRICE (USD)</TableColumn>
              <TableColumn>XRATE LAST UPDATED</TableColumn>
            </TableHeader>
            <TableBody>
              {selectedCurrencies.toSorted().map((tokenId) => (
                <TableRow key={tokenId}>
                  <TableCell>{tokenId}</TableCell>
                  <TableCell>{convertFromUSDTo(tokenId)}</TableCell>
                  <TableCell>{1500}</TableCell>
                  <TableCell>3 mins ago</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
