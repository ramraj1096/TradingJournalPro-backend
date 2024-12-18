import {Request, Response} from "express";
import User from "../models/user";
import Trade from "../models/trade";
import { TradeDTO } from "../dtos/dto";
import Journal from "../models/journal";

export const addTrade = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            assetName,
            quantity,
            assetType,
            tradeType,
            tradeCategory,
            enterPrice,
            stopLoss,
            exitPrice,
            strategyName,
            strategyDescription,
            date,
        }: {
            assetName: string;
            quantity: number;
            assetType: string;
            tradeType: string;
            tradeCategory: string;
            enterPrice: number;
            stopLoss: number;
            exitPrice: number;
            strategyName: string;
            strategyDescription: string;
            date: Date;
        } = req.body;

        const { userId } = req.params;

       

        
        if (
            !assetName ||
            !quantity ||
            !assetType ||
            !tradeType ||
            !tradeCategory ||
            !enterPrice ||
            !stopLoss ||
            !exitPrice ||
            !strategyName ||
            !strategyDescription ||
            !date
        ) {
            res.status(400).json({
                success: false,
                message: "All fields required",
            });
            return;
        }

        
        const user = await User.findById(userId).exec();
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User Not Found",
            });
            return;
        }

        
        const tradedValue = quantity * enterPrice;
        const currentValue = quantity * exitPrice;
        let profitOrLoss = currentValue - tradedValue;

        
        if (tradeCategory === "sell") {
            profitOrLoss =  tradedValue - currentValue;
        }
        if (assetType === "equity" || assetType === "commodity") {
            profitOrLoss = profitOrLoss * 5;
        }

        // Handle "Day Trade" separately
        if (tradeType === "Day Trade") {
       
            const journal = new Journal({
                assetName,
                assetType,
                quantity,
                tradeCategory,
                journalFor: "Trade",
                enterPrice,
                stopLoss,
                exitPrice,
                totalTradedValue: tradedValue,
                profitorLoss: profitOrLoss,
                date,
                strategyName,
                strategyDescription,
                user: user?._id,
            });

            await journal.save();

            user.journal.push(journal._id);
            await user.save();

            res.status(201).json({
                success: true,
                message: "Trade added successfully in Journals",
            });
            return;
        }

        // Create a regular trade
        const trade = new Trade({
            assetName,
            quantity,
            assetType,
            tradeType,
            totalTradeValue: tradedValue,
            tradeCategory,
            enterPrice,
            stopLoss,
            exitPrice,
            profitOrLoss,
            strategyName,
            strategyDescription,
            date,
            user: user._id,
        });

        await trade.save();

        user.trades.push(trade._id);
        await user.save();


        const tradeInfo: TradeDTO = {
            assetName: trade.assetName,
            quantity: trade.quantity,
            assetType: trade.assetType,
            tradeType: trade.tradeType,
            tradeCategory: trade.tradeCategory,
            enterPrice: trade.enterPrice,
            stopLoss: trade.stopLoss,
            exitPrice: trade.exitPrice,
            totalTradedValue: trade.totalTradeValue,
            strategyName: trade.strategyName,
            strategyDescription: trade.strategyDescription,
            date: trade.date,
        };

        res.status(201).json({
            success: true,
            message: "Trade added successfully",
            tradeInfo: tradeInfo,
        });


    } catch (err: any) {
        console.error("Error in adding trade:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


export const getAllTrades = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User Not Found",
            });
            return;
        }

        const trades = await Trade.find({ user: userId });

        if (trades.length === 0) {
            res.status(200).json({
                success: true,
                message: "No active Trades",
                trades: [], // Changed 'holdings' to 'trades' for consistency
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Active Trades",
            trades: trades, // Changed 'holdings' to 'trades'
        });
    } catch (err: any) {
        console.error("Error fetching trades:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const getTrade = async (req: Request, res: Response) : Promise<void> => {

    try {
        const { userId, id} = req.params;

    const user = await User.findById(userId);

    if (!user) {
        res.status(404).json({
            success: false,
            message: "User Not Found",
        });
        return;
    }

    const trade = await Trade.findById(id);

    if (!trade) {
        res.status(404).json({
            success: false,
            message: "Trade Not Found",
        });
        return;
    }

    if (trade.user.toString() !== userId) {
        res.status(403).json({
            success: false,
            message: "You are not authorized to get this trade",
        });
        return;
    }

    const tradeInfo : TradeDTO = {
        assetName: trade.assetName,
            quantity: trade.quantity,
            assetType: trade.assetType,
            tradeType: trade.tradeType,
            tradeCategory: trade.tradeCategory,
            enterPrice: trade.enterPrice,
            stopLoss: trade.stopLoss,
            exitPrice: trade.exitPrice,
            totalTradedValue: trade.totalTradeValue,
            strategyName: trade.strategyName,
            strategyDescription: trade.strategyDescription,
            date: trade.date,
    }

    res.status(200).json({
        success: true,
        message: "Trade Info here",
        holdingInfo: tradeInfo,
    });
    } catch (err: any) {
        console.error("Error in adding trade:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const updateTrade = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, id } = req.params;
        const {
            assetName,
            quantity,
            assetType,
            tradeType,
            tradeCategory,
            enterPrice,
            stopLoss,
            exitPrice,
            strategyName,
            strategyDescription,
            date,
        }: {
            assetName: string;
            quantity: number;
            assetType: string;
            tradeType: string;
            tradeCategory: string;
            enterPrice: number;
            stopLoss: number;
            exitPrice: number;
            strategyName: string;
            strategyDescription: string;
            date: Date;
        } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        // Check if trade exists
        const trade = await Trade.findById(id);
   
        if (!trade) {
            res.status(404).json({
                success: false,
                message: "Trade not found",
            });
            return;
        }

        // Ensure the trade belongs to the user
        if (trade.user.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: "You are not authorized to update this trade",
            });
            return;
        }

        // Update trade details
        trade.assetName = assetName || trade.assetName;
        trade.quantity = quantity || trade.quantity;
        trade.assetType = trade.assetType;
        trade.tradeType = trade.tradeType;
        trade.tradeCategory = trade.tradeCategory || tradeCategory;
        trade.enterPrice = enterPrice || trade.enterPrice;
        trade.stopLoss = stopLoss || trade.stopLoss;
        trade.exitPrice = exitPrice || trade.exitPrice;
        trade.strategyName = strategyName || trade.strategyName;
        trade.strategyDescription = strategyDescription || trade.strategyDescription;
        trade.date = date || trade.date;

        

        // Validate quantity, enterPrice, and exitPrice to ensure they are numbers
        
        const validExitPrice = Number.isFinite(exitPrice) ? exitPrice : 0;

        // Calculate updated values
        const tradedValue = trade.quantity * trade.enterPrice;
        const currentValue = trade.quantity * validExitPrice;
        let profitOrLoss = currentValue - tradedValue;

        if (tradeCategory === "sell") {
            profitOrLoss = tradedValue - currentValue;
        }
        if (assetType === "equity" || assetType === "commodity") {
            profitOrLoss = profitOrLoss * 5;
        }

        // Ensure profitOrLoss is a valid number
        trade.totalTradeValue = tradedValue;
        trade.profitOrLoss = !isNaN(profitOrLoss) ? profitOrLoss : 0;

        // Save the updated trade
        await trade.save();

        const tradeInfo: TradeDTO = {
            assetName: trade.assetName,
            quantity: trade.quantity,
            assetType: trade.assetType,
            tradeType: trade.tradeType,
            tradeCategory: trade.tradeCategory,
            enterPrice: trade.enterPrice,
            stopLoss: trade.stopLoss,
            exitPrice: trade.exitPrice,
            totalTradedValue: trade.totalTradeValue,
            strategyName: trade.strategyName,
            strategyDescription: trade.strategyDescription,
            date: trade.date,
        };

        res.status(200).json({
            success: true,
            message: "Trade updated successfully",
            updatedTrade: tradeInfo,
        });
    } catch (err: any) {
        console.error("Error in updating trade:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};



export const squareOff = async (req: Request, res: Response): Promise<void> => {

    try {
        const { userId, id } = req.params;
        // Step 1: Find the holding by ID
        const trade = await Trade.findById(id);

        if (!trade) {
             res.status(404).json({
                success: false,
                message: "Trade not found",
            });

            return;
        }

        // Step 2: Find the user by ID
        const currentUser = await User.findById(userId).exec();

        if (!currentUser) {
             res.status(404).json({
                success: false,
                message: "User not found",
            });

            return;
        }

        // Step 3: Check if the holding belongs to the user
        if (trade.user.toString() !== userId) {
             res.status(403).json({
                success: false,
                message: "You are not authorized to square off this trade",
            });

            return;
        }

        // step 4 trade --> journal
        const journal = new Journal({
            assetName: trade.assetName,
            assetType: trade.assetType,
            quantity: trade.quantity,
            tradeType: trade.tradeType,
            tradeCategory: trade.tradeCategory,
            journalFor: "Trade",
            enterPrice: trade.enterPrice,
            stopLoss: trade.stopLoss,
            exitPrice: trade.exitPrice,
            totalTradedValue: trade.totalTradeValue,
            profitorLoss: trade.profitOrLoss,
            date: trade.date,
            strategyName: trade.strategyName,
            strategyDescription: trade.strategyDescription,
            user: currentUser._id,
        });

        await journal.save();

        currentUser.journal.push(journal._id);
        await currentUser.save();


        await User.findByIdAndUpdate(
            userId, 
            { $pull: { trades: trade._id } },  
            { new: true }
        );
        await currentUser.save();


        await trade.deleteOne();

        res.status(201).json({
            success: true,
            message: "Trade added successfully in Journals ",
        });

        return;

    } catch (err: any) {
        console.error("Error in updating trade:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}


export const overViewOfTrades = async(req: Request, res:Response): Promise<void> => {
    try {
        const { userId } = req.params;
      

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User Not Found"
            });
            return;
        }

        const holdings = await Trade.find({ user: userId });

        if (holdings.length === 0) {
            res.status(200).json({
                success: true,
                message: "No active trades",
                totalTradedVal: 0,
            currentInvestmentValue: 0,
            totalProfit: 0,
            totalLoss: 0,
            });
            return;
        }

        let totalTradedValue = 0;
        let currentInvestmentValue = 0;
        let totalProfit = 0;
        let totalLoss = 0;
        holdings.forEach(function(trade) {
            totalTradedValue += trade.totalTradeValue;
            currentInvestmentValue += trade.profitOrLoss + totalTradedValue;

            let PL = trade.profitOrLoss
            if (PL > 0) {
                totalProfit += PL;
            }
            else {
                totalLoss += PL;
            }
        });

        res.status(200).json({
            success: true,
            message: "wellcome to analytics tab!",
            totalTradedVal: totalTradedValue,
            currentInvestmentValue: currentInvestmentValue,
            totalProfit: totalProfit,
            totalLoss: totalLoss,
        })
    } catch (err: any) {
        console.error("Error in overview trade:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}


export const analyticChartDataofTrades = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        // Fetch user details
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User Not Found",
            });
            return;
        }

        // Fetch user holdings
        const trades = await Trade.find({ user: userId });

        if (trades.length === 0) {
            res.status(200).json({
                success: true,
                message: "No active trades",
                trades: [],
            });
            return;
        }

        // Type definition for response
        type Data = {
            assetName: string;
            totalTradedValue: number;
            PL: number;
        };

        const response: Data[] = [];
        let responseSent = false;

        

        // Calculate investment details for each holding
        trades.forEach((trade) => {

            response.push({
                assetName: trade.assetName,
                totalTradedValue: trade.totalTradeValue,
                PL: trade.profitOrLoss,
            });

           

            // Send response when there are 6 entries in response
            if (response.length === 6 && !responseSent) {
                responseSent = true; // Prevent further responses
                res.status(200).json({
                    success: true,
                    message: "Welcome to analytics tab!",
                    trades: response,
                });
            }
        });

        // Send final response if holdings are fewer than 6 and the response wasn't already sent
        if (!responseSent) {
            res.status(200).json({
                success: true,
                message: "Welcome to analytics tab!",
                trades: response,
            });
        }

    } catch (err: any) {
        console.error("Error in analyticChartDataofTrades:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};