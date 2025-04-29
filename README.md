Fun.xyz - a feature for a crypto platform where users can explore potential token swaps. They need a simple tool to select two tokens (a source and a target) and input a USD amount to see the approximate equivalent amounts in those tokens.

## Running Locally

1. Make sure the FUN_API_KEY environment variable is set to a key that works with @funkit/api-base. For example, set it in .env.local
2. ```npm install```
3. ```npm run dev```

I'm using Node v20.11.1 through 'nvm' NOTE: there is a .nvmrc file so you can do:

```nvm use```

if you use nvm

## Currency API Calls Setup (front-end vs back-end)

Accessing the Fun.xyz Base API is done through Route Handlers (server-side). The front-end calls Next back-end end-points, which, in turn, make calls using the Fun.xyz library.

This ensures API keys aren't exposed by the front-end.

## Currency API tradeoffs/assumptions

After examinging the Fun.xyz Base API, it seems, given a coin, the "exchange rate" is always given in "how many dollars to buy one unit of X coin" i.e. the call to getAssetPriceInfo() doesn't seem to to be able to take a USD amount,

So, this means, given an input of USD through the UI, we need to query how many USD for one unit of the coins we're trying to convert.

We take the reciprocal of each unit price and multiply by the USD provided through the UI.

## Caching

I've added a "cache" for exchange rate for the coins within the main Home component. The exchange rate is stored in a state variable.

This is mostly so when users are typing different values in the USD input form, we aren't sending requests to the Fun.xyz API on every input change.

This is a trade-off - less requests to the Fun.xyz API vs exchange rate being less real-time.

In production, depending on how resilient the back-end for the Fast.xyz API is and how important we think it is for Fun.xyz clients to get real-time exchange rates, this caching can be tweaked and/or removed.

For example, perhaps free users of the Fast.xyz API are rate-limited on requests, so caching for a free API user is more important.

The latest exchange rate can be retrieved by deselecting a token and re-selecting it.

It could be more streamlined by having a refresh button in the last column of the table, so a user wouldn't have to de-select + reselect a token to get the latest conversion.

## Currency Filter Behavior

The assignment PDF mentioned the UI is for token swaps with an input of USD. So, I designed the UI to only allow two crypto selections at a time. If the user presses a 3rd currency/coin, the least recently selected currency is de-selected.

This ensures the last selected coin is always selected.

An alternative would have been to allow any number of coins to be selected beyond 2, but I'm assuming the assignment requirements are specifying a FIFO queue for selections, essentially.

The middle-layer of this app is set up to cache exchange rates for up to 1 minute, so showing conversions for more than 2 coins would theoretically not be an extra network request if the UI interaction is within the cache time of 1 minute.

And, it would, arguably, be a more useful product if it could show more than 2 coin conversions simultaneously.

## Libraries

I used Hero UI for the components. The styling code is succinct and I like the aesthetic.

Raw TailWind seemed like it may be too verbose, and Material UI could maybe be too restrictive.

## Vercel Deployment

The app is deployed on Vercel at https://funxzy-token-converter-nextjs-pa7x.vercel.app
