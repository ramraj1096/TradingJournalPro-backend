import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
    assetName: {
        type: String,
        required: [true, "Asset name is required"],
        trim: true,
    },
    tradeType : {
        type: String,
        required: [true, "Trade type is required"],
        enum: ["Swing Trade", "Day Trade", "BTST"], 
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"],
    },

    assetType: {
        type: String,
        required: [true, "Trade category is required"],
        enum: ["equity", "option", "commodity"], 
    },

    totalTradeValue: { 
        type: Number,
        default: 0, 
    },

    tradeCategory: {
        type: String,
        required: [true, "Trade category is required"],
        enum: ["buy", "sell"], 
    },

    profitOrLoss: {
        type: Number,
        default: 0,
    },

    enterPrice: {
        type: Number,
        default: 0,
    },

    stopLoss: {
        type: Number,
        default: 0,
    },

    exitPrice: {
        type: Number,
        default: 0,
    },

    strategyName: {
        type: String,
        required: [true, "Strategy name is required"],
        trim: true,
    },

    strategyDescription: {
        type: String,
        required: [true, "Strategy description is required"],
        trim: true,
    },

    date: {
        type: Date,
        required: [true, "Date is required"],
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User reference is required"], 
    },

    createdAt: {
        type: Date,
        default: Date.now, 
    },
    
});

const Trade = mongoose.model("Trade", tradeSchema);
export default Trade;
