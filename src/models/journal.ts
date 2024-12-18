import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
    assetName: {
        type: String,
        required: [true, "Asset name required"]
    },

    journalFor: {
        type: String,
        required: [true, "Asset type is required"],
        enum: ["Trade", "Holding"],
    },

    assetType: {
        type: String,
        required: [true, "Asset type is required"],
        enum: ["equity", "option", "commodity"], 
    },

    quantity: {
        type: Number,
        default: 0,
        required: [true, "Quantity is required"],
    },

    enterPrice: {
        type: Number,
        default: 0,
        required: [true, "Enter price is required"],
    },

    stopLoss: {
        type: Number,
        default: 0,
    },

    exitPrice: {
        type: Number,
        default:0,
        required: [true, "Exit price is required"],
    },

    totalTradedValue: {
        type: Number,
        required: [true, "Total traded value required"],
        min: [0, "Total traded value cannot be negative"]
    },

    tradeCategory: {
        type: String,
        required: [true, "Trade category is required"],
        enum: ["buy", "sell"], 
    },

    profitorLoss: {
        type: Number,
        required: [true, "Profit or loss value required"],
        min: [-Infinity, "Profit or loss cannot be negative"]
    },

    date: {
        type: Date,
        required: [true, "Date is required"]
    },

    strategyName: {
        type: String,
        required: [true, "Strategy required"]
    },

    strategyDescription: {
        type: String,
        required: [true, "Description is required"]
    },

    createdAt: {
        type: Date,
        default: Date.now 
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User reference is required"], 
    },
});

const Journal = mongoose.model('Journal', journalSchema);

export default Journal;
