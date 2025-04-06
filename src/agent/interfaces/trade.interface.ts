export type BuyPayload = {
    tokenSymbol: string;
    usdAmount: number;
}

export type SellPayload = {
    tokenSymbol: string;
    tokenAmount: number;
}


export type TradeStep = {
    type: 'buy';
    data: BuyPayload;
    reason: string;
} | {
    type: 'sell';
    data: SellPayload;
    reason: string;
}

export type TradePlan = {
    steps: TradeStep[];
}

export type AgentTradePlan = {
    thoughts: string;
    tradeSteps: TradeStep[];
}