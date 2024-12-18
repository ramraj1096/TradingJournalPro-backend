import {Request, Response} from "express";
import User from "../models/user";
import Journal from "../models/journal";


export const addJournal = async (req: Request, res: Response): Promise<void> => {
    try {
        const {userId} = req.params;

        const {assetName, 
            journalFor, 
            assetType, 
            quantity,
            enterPrice, 
            stopLoss, 
            exitPrice, 
            tradeCategory, 
            date, 
            strategyName, 
            strategyDescription
        } : {
            assetName:string, 
            journalFor:string, 
            assetType:string, 
            quantity: number,
            enterPrice:number, 
            stopLoss:number, 
            exitPrice:number, 
            // totalTradedValue:number, 
            tradeCategory:string, 
            // profitorLoss:number, 
            date:Date, 
            strategyName:string, 
            strategyDescription:string
        }= req.body;


        if (!assetName ||  !journalFor ||  !assetType || !quantity || !enterPrice ||  !stopLoss ||
             !exitPrice  || !tradeCategory || !date || !strategyName || !strategyDescription) {
                res.status(400).json({
                    success: false,
                    message: "All fields required"
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

        const newJournal = new Journal({
            assetName, 
            journalFor, 
            assetType, 
            quantity,
            enterPrice, 
            stopLoss, 
            exitPrice, 
            totalTradedValue: tradedValue, 
            tradeCategory, 
            profitorLoss: profitOrLoss, 
            date, 
            strategyName, 
            strategyDescription,
            user: user._id
        });

        await newJournal.save();

        user.journal.push(newJournal._id);

        await user.save();

        res.status(201).json({
            success: true,
            message: "Journal added successfully",
            journal: newJournal,
        });


    } catch (err: any) {
        console.error("Error in adding holding:", err.message);
            res.status(500).json({
                success: false,
                message: err.message,
            });
    }
}


export const getAllJournals = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId).exec();
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User Not Found",
            });
            return;
        }

        // Fetch journals for the user and sort by date in descending order
        const journals = await Journal.find({ user: userId }).sort({ date: -1 });

        if (journals.length === 0) {
            res.status(200).json({
                success: true,
                message: "No active Journals",
                journals: [],
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Active journals",
            journals: journals,
        });
    } catch (err: any) {
        console.error("Error fetching journals:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


export const updateJournal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, id } = req.params;

        const {
            assetName,
            journalFor,
            assetType,
            quantity,
            enterPrice,
            stopLoss,
            exitPrice,
            tradeCategory,
            date,
            strategyName,
            strategyDescription,
        }: {
            assetName: string;
            journalFor: string;
            assetType: string;
            quantity: number;
            enterPrice: number;
            stopLoss: number;
            exitPrice: number;
            tradeCategory: string;
            date: Date;
            strategyName: string;
            strategyDescription: string;
        } = req.body;

        // Validate required fields
        if (
            !assetName ||
            !journalFor ||
            !assetType ||
            !quantity ||
            !enterPrice ||
            !stopLoss ||
            !exitPrice ||
            !tradeCategory ||
            !date ||
            !strategyName ||
            !strategyDescription
        ) {
            res.status(400).json({
                success: false,
                message: "All fields required",
            });
            return;
        }

        // Check if user exists
        const user = await User.findById(userId).exec();
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User Not Found",
            });
            return;
        }

        // Find the journal entry
        const journal = await Journal.findById(id);
        if (!journal) {
            res.status(404).json({
                success: false,
                message: "Journal entry not found",
            });
            return;
        }

        // Check if the journal belongs to the user
        if (userId !== journal.user.toString()) {
            res.status(403).json({
                success: false,
                message: "You are not authorized to update this journal entry",
            });
            return;
        }

        // Calculate values
        const tradedValue = quantity * enterPrice;
        const currentValue = quantity * exitPrice;
        let profitOrLoss = currentValue - tradedValue;

        if (tradeCategory === "sell") {
            profitOrLoss = tradedValue - currentValue;
        }

        if (assetType === "equity" || assetType === "commodity") {
            profitOrLoss *= 5;
        }

        // Update the journal entry
        const updatedJournal = await Journal.findOneAndUpdate(
            { _id: id, user: userId }, // Match the journal entry for the user
            {
                assetName,
                journalFor,
                assetType,
                quantity,
                enterPrice,
                stopLoss,
                exitPrice,
                totalTradedValue: tradedValue,
                profitorLoss: profitOrLoss,
                tradeCategory,
                date,
                strategyName,
                strategyDescription,
            },
            { new: true, runValidators: true } // Return the updated document and validate schema
        );

        // Respond with the updated journal entry
        res.status(200).json({
            success: true,
            message: "Journal updated successfully",
            journal: updatedJournal,
        });
    } catch (err: any) {
        console.error("Error updating journal:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


export const getJournal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, journalId } = req.params;

        // Validate required parameters
        if (!userId || !journalId) {
            res.status(400).json({
                success: false,
                message: "User ID and Journal ID are required",
            });
            return;
        }

        // Check if the user exists
        const user = await User.findById(userId).exec();
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        // Retrieve the journal entry
        const journal = await Journal.findOne({ _id: journalId, user: userId }).exec();
        if (!journal) {
            res.status(404).json({
                success: false,
                message: "Journal entry not found",
            });
            return;
        }

        // Return the journal entry
        res.status(200).json({
            success: true,
            message: "Journal entry retrieved successfully",
            journal: journal,
        });
    } catch (err: any) {
        console.error("Error retrieving journal:", err.message);
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the journal entry",
        });
    }
};


export const deleteJournal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, journalId } = req.params;

        // Validate required parameters
        if (!userId || !journalId) {
            res.status(400).json({
                success: false,
                message: "User ID and Journal ID are required",
            });
            return;
        }

        // Check if the user exists
        const user = await User.findById(userId).exec();
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

       const journal = await Journal.findById(journalId);

        if (!journal) {
            res.status(404).json({
                success: false,
                message: "Journal entry not found",
            });
            return;
        }

        await User.findByIdAndUpdate(
            userId, 
            { $pull: { holdings: journal._id } },  
            { new: true }
        );
        await user.save();


        // Step 6: Delete the holding from the database
        await journal.deleteOne();

        // Respond with success
        res.status(200).json({
            success: true,
            message: "Journal entry deleted successfully",
        });
    } catch (err: any) {
        console.error("Error deleting journal:", err.message);
        res.status(500).json({
            success: false,
            message: "An error occurred while deleting the journal entry",
        });
    }
};


export const overViewOfJournal = async(req: Request, res:Response): Promise<void> => {
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

        const holdings = await Journal.find({ user: userId });
        console.log(holdings);

        if (holdings.length === 0) {
            res.status(200).json({
                success: true,
                message: "No active journals",
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
            totalTradedValue += trade.totalTradedValue;
            currentInvestmentValue += trade.profitorLoss + totalTradedValue;

            let PL = trade.profitorLoss
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
        console.error("Error in overview journal:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}


export const analyticChartDataofJournals = async (req: Request, res: Response): Promise<void> => {
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
        const trades = await Journal.find({ user: userId });

        if (trades.length === 0) {
            res.status(200).json({
                success: true,
                message: "No active journals",
                journals: [],
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
                totalTradedValue: trade.totalTradedValue,
                PL: trade.profitorLoss,
            });

            

            // Send response when there are 6 entries in response
            if (response.length === 6 && !responseSent) {
                responseSent = true; // Prevent further responses
                
                res.status(200).json({
                    success: true,
                    message: "Welcome to analytics tab!",
                    journals: response,
                });
            }
        });

        // Send final response if holdings are fewer than 6 and the response wasn't already sent
        if (!responseSent) {
            res.status(200).json({
                success: true,
                message: "Welcome to analytics tab!",
                journals: response,
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
