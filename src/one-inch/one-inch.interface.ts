export interface GetWalletTokenBalancesResponse {
  [key: string]: string;
}

export interface GetTokenPricesResponse {
  [key: string]: string;
}

export interface GetPortfolioProfitAndLossResponse {
  result: { abs_profit_usd: number; chain_id: string; roi: number }[];
}

export interface GetPortfolioValueChartResponse {
  result: { timestamp: number; value_usd: number }[];
}

export interface GetPortfolioCurrentValueResponse {
  result: { address: string; value_usd: number }[];
}

export interface GetPortfolioErc20DetailsResponse {
  result: {
    chain_id: number;
    contract_address: string;
    name: string;
    symbol: string;
    amount: number;
    price_to_usd: number;
    value_usd: number;
    abs_profit_usd: number;
    roi: number;
    status: number;
  }[];
}
