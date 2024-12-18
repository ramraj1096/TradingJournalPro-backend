
export interface UserDTO {
    name: string;
    email: string;
    _id: any;
}

export interface HoldingDTO {
    assetName: string,
    quantity: Number,
    boughtPrice: Number,
    currentPrice: Number,
    totalInvestment: Number,
    currentInvestment: Number,
    _id: any,

}

export interface TradeDTO {
    assetName: string, 
    quantity: Number, 
    assetType: string, 
    tradeType: string, 
    tradeCategory: string, 
    enterPrice: Number, 
    stopLoss: Number,
    exitPrice: Number,
    totalTradedValue: Number,
    strategyName: string, 
    strategyDescription: string, 
    date: Date
}

export interface HoldingJournalDTO {
    assetName: string,
    assetType: string,
    createdAt: Date,
    totalTradedValue: Number,
    tradeType: string,
    profitorloss: Number,
    _id: any,
}
