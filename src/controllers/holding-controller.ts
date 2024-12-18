import { Request, response, Response, } from "express"
import Holding from "../models/holding";
import { HoldingDTO, HoldingJournalDTO } from "../dtos/dto";
import User from "../models/user";
import Journal from "../models/journal";
import mongoose, { ClientSession } from "mongoose";

export const addHolding = async (req: Request, res: Response): Promise<void> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            assetName,
            quantity,
            boughtPrice,
            currentPrice,
            date,
        }: {
            assetName: string;
            quantity: number;
            boughtPrice: number;
            currentPrice: number;
            date: Date;
        } = req.body;

        const { userId } = req.params;

        if (!assetName || !quantity || !boughtPrice || !currentPrice) {
            throw new Error("All fields are required");
        }

        if (quantity < 0 || boughtPrice < 0 || currentPrice < 0) {
            throw new Error("Quantity, bought price, and current price cannot be negative");
        }

        const currentUser = await User.findById(userId).session(session);
        if (!currentUser) {
            throw new Error("User not found");
        }

        const totalInvestedValue = quantity * boughtPrice;
        const currentInvestmentValue = quantity * currentPrice;

        const newHolding = new Holding({
            assetName,
            quantity,
            boughtPrice,
            currentPrice,
            totalInvestedValue,
            currentInvestmentValue,
            date,
            user: currentUser._id,
        });

        await newHolding.save({ session });

        currentUser.holdings.push(newHolding._id);

        const newJournal = new Journal({
            journalFor: "Holding",
            assetName: newHolding.assetName,
            date: newHolding.date,
            quantity: newHolding.quantity,
            createdAt: Date.now(),
            assetType: "equity",
            enterPrice: newHolding.boughtPrice,
            exitPrice: newHolding.currentPrice,
            totalTradedValue: newHolding.totalInvestedValue,
            tradeCategory: "buy",
            profitorLoss: newHolding.currentInvestmentValue - newHolding.totalInvestedValue,
            strategyName: "Holded Asset || Long-term investment",
            strategyDescription: "Long-term investment",
            user: currentUser._id,
        });

        await newJournal.save({ session });
        currentUser.journal.push(newJournal._id);

        await currentUser.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: "Holding added successfully",
            holdingInfo: {
                assetName,
                quantity,
                boughtPrice,
                currentPrice,
                totalInvestment: totalInvestedValue,
                currentInvestment: currentInvestmentValue,
                _id: newHolding._id,
            },
        });
    } catch (err: any) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in adding holding:", err.message);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const getHolding = async(req: Request, res: Response) : Promise<void> => {

    const { id, userId } = req.params;

    const currentUser = await User.findById(userId).exec();

    if (!currentUser) {
        res.status(404).json({
            success: false,
            message: "User not found",
        });
        return;
    }

    const holding = await Holding.findById(id);

    if(!holding) {
        res.status(404).json({
            success: false,
            message: "Holding not found"
        });
        return;
    }

    if (holding.user.toString() !== userId) {
        res.status(403).json({
            success: false,
            message: "You are not authorized to update this holding",
        });
        return;
    }

    const holdingInfo : HoldingDTO = {
        assetName: holding.assetName,
        quantity: holding.quantity,
        boughtPrice: holding.boughtPrice,
        currentPrice: holding.currentPrice,
        totalInvestment: holding.totalInvestedValue,
        currentInvestment: holding.currentInvestmentValue,
        _id: holding._id,

    };

    res.status(200).json({
        success: true,
        message: "Holding fetched successfully",
        holdingInfo: holdingInfo,
    });

    return;
}

export const getAllHoldingsofUser = async(req: Request, res: Response): Promise<void> => {
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

        const holdings = await Holding.find({ user: userId });

        if (holdings.length === 0) {
            res.status(200).json({
                success: true,
                message: "No active holdings",
                holdings: [],
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Active holdings",
            holdings: holdings,
        });
        
    } 
    catch (err: any) {
        console.error("Error fetching holdings:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}


export const updateHolding = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            assetName, 
            quantity, 
            boughtPrice, 
            currentPrice,
            date }: {
                
                assetName: string; 
                quantity: number; 
                boughtPrice: number; 
                currentPrice: number;
                date: Date;
        } = req.body;

        const { userId, id } = req.params;  // Holding ID from URL params

        const holding = await Holding.findById(id);

        if (!holding) {
            res.status(404).json({
                success: false,
                message: "Holding not found",
            });
            return;  
        }

       
        // if (!assetName || !quantity || !boughtPrice || !currentPrice) {
        //     res.status(400).json({
        //         success: false,
        //         message: "All fields are required",
        //     });
        //     return;
        // }

        // Validate that the fields are non-negative
        if (quantity < 0) {
            res.status(400).json({
                success: false,
                message: "Quantity can't be negative",
            });
            return;
        }

        if (boughtPrice < 0) {
            res.status(400).json({
                success: false,
                message: "Bought price can't be negative",
            });
            return;
        }

        if (currentPrice < 0) {
            res.status(400).json({
                success: false,
                message: "Current price can't be negative",
            });
            return;
        }

        if (!userId) {
            res.status(400).json({
                success: false,
                message: "userId required",
            });
            return;
        }

        // Check if the user exists
        const currentUser = await User.findById(userId).exec();

        if (!currentUser) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;  
        }

        // Check if the holding belongs to the user (authorization)
        if (holding.user.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: "You are not authorized to update this holding",
            });
            return;
        }

        // Update the holding with the new values
        holding.assetName = assetName || holding.assetName;  // Use existing value if no update
        holding.quantity = quantity || holding.quantity;
        holding.boughtPrice = boughtPrice || holding.boughtPrice;
        holding.currentPrice = currentPrice || holding.currentPrice;
        holding.date = date || holding.date;

        holding.totalInvestedValue = holding.quantity * holding.boughtPrice;
        holding.currentInvestmentValue = holding.quantity * holding.currentPrice;

       
        await holding.save();

        //dto
        const holdingInfo : HoldingDTO = {
            assetName: assetName,
            quantity: quantity,
            boughtPrice: boughtPrice,
            currentPrice: currentPrice,
            totalInvestment: holding.quantity * holding.boughtPrice,
            currentInvestment: holding.quantity * holding.currentPrice,
            _id: holding._id,

        };

        res.status(200).json({
            success: true,
            message: "Holding updated successfully",
            holding: holdingInfo,
        });

    } catch (err: any) {
        console.error("Error updating holding:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};



export const squareOff = async (req: Request, res: Response): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId, id } = req.params;

        // Step 1: Find the holding by ID
        const holding = await Holding.findById(id).session(session); // Use session for consistency
        if (!holding) {
            await session.abortTransaction();
            res.status(404).json({
                success: false,
                message: "Holding not found",
            });
            return; // Early return after sending response
        }

        // Step 2: Find the user by ID
        const currentUser = await User.findById(userId).exec();
        if (!currentUser) {
            await session.abortTransaction();
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return; // Early return after sending response
        }

        // Step 3: Check if the holding belongs to the user
        if (holding.user.toString() !== userId) {
            await session.abortTransaction();
            res.status(403).json({
                success: false,
                message: "You are not authorized to square off this holding",
            });
            return; // Early return after sending response
        }

        // Step 4: Create a new journal entry
        const newHoldingJournal = new Journal({
            journalFor: "Holding",
            assetName: holding.assetName,
            date: Date.now(),
            quantity: holding.quantity,
            createdAt: Date.now(),
            assetType: "equity",
            enterPrice: holding.boughtPrice,
            exitPrice: holding.currentPrice,
            totalTradedValue: holding.totalInvestedValue,
            tradeCategory: "sell",
            profitorLoss: holding.currentInvestmentValue - holding.totalInvestedValue,
            strategyName: "Holded Asset || Longterm investment",
            strategyDescription: "Longterm investment",
            user: currentUser?._id,
        });

        await newHoldingJournal.save({ session });

        // Step 5: Save journal to user's journal array
        currentUser.journal.push(newHoldingJournal._id);
        await currentUser.save({ session });

        // Step 6: Remove the holding from the user's holdings
        await User.findByIdAndUpdate(
            userId,
            { $pull: { holdings: holding._id } },
            { new: true, session }
        );

        // Step 7: Delete the holding from the database
        await holding.deleteOne({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Create DTO for journal
        const journalInfo: HoldingJournalDTO = {
            assetName: newHoldingJournal.assetName,
            assetType: newHoldingJournal.assetType,
            createdAt: newHoldingJournal.createdAt,
            totalTradedValue: newHoldingJournal.totalTradedValue,
            tradeType: newHoldingJournal.tradeCategory,
            profitorloss: newHoldingJournal.profitorLoss,
            _id: newHoldingJournal._id,
        };

        // Step 8: Respond with success
        res.status(200).json({
            success: true,
            message: "Holding squared off successfully, added to Journal",
            journalEntry: journalInfo,
        });
    } catch (err: any) {
        console.error("Error in square off:", err.message);
        await session.abortTransaction();
        session.endSession();

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


export const overViewOfHoldings = async(req: Request, res:Response): Promise<void> => {
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

        const holdings = await Holding.find({ user: userId });

        if (holdings.length === 0) {
            res.status(200).json({
                success: true,
                message: "No active holdings",
                totalInvestment: 0,
            currentInvestmentValue: 0,
            totalProfit: 0,
            totalLoss: 0,
            });
            return;
        }

        let totalInvestment = 0;
        let currentInvestmentValue = 0;
        let totalProfit = 0;
        let totalLoss = 0;
        holdings.forEach(function(holding) {
            totalInvestment += holding.totalInvestedValue;
            currentInvestmentValue += holding.currentInvestmentValue;

            let PL = holding.currentInvestmentValue - holding.totalInvestedValue;
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
            totalInvestment: totalInvestment,
            currentInvestmentValue: currentInvestmentValue,
            totalProfit: totalProfit,
            totalLoss: totalLoss,
        })
    } catch (err: any) {
        console.error("Error in overview holding:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const analyticChartData = async (req: Request, res: Response): Promise<void> => {
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
        const holdings = await Holding.find({ user: userId });

        if (holdings.length === 0) {
            res.status(200).json({
                success: true,
                message: "No active holdings",
                holdings: [],
            });
            return;
        }

        // Type definition for response
        type Data = {
            assetName: string;
            totalInvestmentValue: number;
            PL: number;
        };

        const response: Data[] = [];
        let responseSent = false;

        let totalInvestment = 0;
        let currentInvestmentValue = 0;
        let totalProfit = 0;
        let totalLoss = 0;

        // Calculate investment details for each holding
        holdings.forEach((holding) => {
            const { assetName, totalInvestedValue, currentInvestmentValue: currentValue } = holding;

            totalInvestment += totalInvestedValue;
            currentInvestmentValue += currentValue;

            const profitLoss = currentValue - totalInvestedValue;
            if (profitLoss >= 0) {
                totalProfit += profitLoss;
            } else {
                totalLoss += Math.abs(profitLoss);
            }

            response.push({
                assetName,
                totalInvestmentValue: totalInvestedValue,
                PL: profitLoss,
            });

            // Send response when there are 6 entries in response
            if (response.length === 6 && !responseSent) {
                responseSent = true; // Prevent further responses
                res.status(200).json({
                    success: true,
                    message: "Welcome to analytics tab!",
                    holdings: response,
                });
            }
        });

        // Send final response if holdings are fewer than 6 and the response wasn't already sent
        if (!responseSent) {
            res.status(200).json({
                success: true,
                message: "Welcome to analytics tab!",
                holdings: response,
            });
        }

    } catch (err: any) {
        console.error("Error in analyticChartData:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


