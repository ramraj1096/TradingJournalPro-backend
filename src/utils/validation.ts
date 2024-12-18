import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }
    next();
};

export const validateRegistration: Array<ValidationChain | ((req: Request, res: Response, next: NextFunction) => void)> = [
    body('name').
    notEmpty().
    withMessage('Name is required'),

    body('email').
    isEmail().
    withMessage('Invalid email format'),

    body('password').
    isLength({ min: 6 }).
    withMessage('Password must be at least 6 characters long'),
    handleValidationErrors,
];


export const validateLogin: Array<ValidationChain | ((req: Request, res: Response, next: NextFunction) => void)> = [
   
    body('email').
    isEmail().
    withMessage('Invalid email format'),

    body('password').
    isLength({ min: 6 }).
    withMessage('Password must be at least 6 characters long'),
    handleValidationErrors,
];

export const validateHolding: Array<ValidationChain | ((req: Request, res: Response, next: NextFunction) => void)> = [
    body('assetName')
        .notEmpty()
        .withMessage('Asset name is required'),
    
    body('quantity')
        .isNumeric()
        .withMessage('Quantity must be a number')
        .custom((value) => value >= 0)
        .withMessage('Quantity cannot be negative'),

    body('boughtPrice')
        .isNumeric()
        .withMessage('Bought price must be a number')
        .custom((value) => value >= 0)
        .withMessage('Bought price cannot be negative'),

    body('currentPrice')
        .isNumeric()
        .withMessage('Current price must be a number')
        .custom((value) => value >= 0)
        .withMessage('Current price cannot be negative'),

    body('date')
        .optional()
        .isDate()
        .withMessage('Invalid date format'),

    handleValidationErrors, 
];


export const validateTrades: Array<ValidationChain | ((req: Request, res: Response, next: NextFunction) => void)> = [
   
    body('assetName')
        .isString()
        .notEmpty()
        .withMessage('Asset name must be a non-empty string'),

    
    body('quantity')
        .isInt({ gt: 0 })
        .withMessage('Quantity must be a positive integer'),

  
    body('assetType')
        .isString().
        notEmpty().
        withMessage('Asset type must be a non-empty string'),

    
    body('tradeType')
        .isString().
        notEmpty().
        withMessage('Trade type must be a non-empty string'),

    
    body('tradeCategory')
        .isString().
        notEmpty().
        withMessage('Trade category must be a non-empty string'),

    
    body('enterPrice')
        .isFloat({ gt: 0 })
        .withMessage('Enter price must be a positive number'),

   
    body('stopLoss')
        .isFloat({ gt: 0 })
        .withMessage('Stop loss must be a positive number'),

    
    body('exitPrice')
        .isFloat({ gt: 0 })
        .withMessage('Exit price must be a positive number'),

    body('strategyName')
        .isString().notEmpty()
        .withMessage('Strategy name must be a non-empty string'),


    body('strategyDescription')
        .isString()
        .notEmpty()
        .withMessage('Strategy description must be a non-empty string'),


    body('date')
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date'),
    
    body('exitPrice').custom((value, { req }) => {
        if (value <= req.body.enterPrice) {
            throw new Error('Exit price must be greater than enter price');
        }
        return true;
    }),

    body('stopLoss').custom((value, { req }) => {
        if (value >= req.body.enterPrice) {
            throw new Error('Stop loss must be less than enter price');
        }
        return true;
    }),

    handleValidationErrors, 
];

export const validateJournal: Array<ValidationChain | ((req: Request, res: Response, next: NextFunction) => void)> = [
    body('assetName')
        .isString().withMessage('Asset name must be a string')
        .notEmpty().withMessage('Asset name is required'),

    body('journalFor')
        .isString().withMessage('JournalFor must be a string')
        .isIn(['Holding', 'Trade']).withMessage("JournalFor must be either 'buy' or 'sell'")
        .notEmpty().withMessage('JournalFor is required'),

    body('assetType')
        .isString().withMessage('AssetType must be a string')
        .isIn(['equity', 'commodity', 'forex']).withMessage('AssetType must be either "equity", "commodity", or "forex"')
        .notEmpty().withMessage('AssetType is required'),

    body('quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),

    body('enterPrice')
        .isFloat({ min: 0 }).withMessage('Enter price must be a positive number')
        .notEmpty().withMessage('Enter price is required'),

    body('stopLoss')
        .isFloat({ min: 0 }).withMessage('Stop loss must be a positive number'),

    body('exitPrice')
        .isFloat({ min: 0 }).withMessage('Exit price must be a positive number')
        .notEmpty().withMessage('Exit price is required'),

    body('tradeCategory')
        .isString().withMessage('Trade category must be a string')
        .isIn(['buy', 'sell']).withMessage("Trade category must be either 'buy' or 'sell'")
        .notEmpty().withMessage('Trade category is required'),

    body('date')
        .isDate().withMessage('Date must be a valid date')
        .notEmpty().withMessage('Date is required'),

    body('strategyName')
        .isString().withMessage('Strategy name must be a string')
        .notEmpty().withMessage('Strategy name is required'),

    body('strategyDescription')
        .isString().withMessage('Strategy description must be a string')
        .notEmpty().withMessage('Strategy description is required'),

        handleValidationErrors
];