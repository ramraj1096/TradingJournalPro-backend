import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
    assetName: {
        type: String,
        required: [true, "Asset name is required"],
        trim: true,
    },

    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"],
    },

    boughtPrice : {
        type: Number,
        required: [true, "Bought price required"]
    },

    currentPrice : {
        type: Number,
        required: [true, "Bought price required"],
        
    },

    totalInvestedValue: { // quantity*bought price
        type: Number,
        min: [0, "Total invested value cannot be negative"], 
        default: 0, 
    },

    currentInvestmentValue: { //quantity*current price
        type: Number,
        min: [0, "Current investment value cannot be negative"], 
        default: 0, 
    },

    date: {
        type: Date,
        required: [true, "Date is required"],
        default: Date.now, 
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

const Holding = mongoose.model("Holding", holdingSchema);

export default Holding;
