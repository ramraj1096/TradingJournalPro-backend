import bcrypt from 'bcrypt';
import User from '../models/user';
import { Request, Response } from 'express';
import { UserDTO } from '../dtos/dto';
import { generateToken } from '../middlewares/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: "Please enter all fields",
            });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
            return;
        }

       
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "User already exists",
            });
            return;
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

       
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const userInfo: UserDTO = {
            name: newUser.name,
            email: newUser.email,
            _id: newUser._id,
        };

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: userInfo,
        });
    } catch (err) {
        console.error("Error in register:", err);
        res.status(500).json({
            success: false,
            message: "Error registering user",
        });
    }
};


export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

     
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Please enter all fields",
            });
            return;
        }

       
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found",
            });
            return;
        }

   
        if (user.isBanned) {
            const currentTime = new Date();
            const banTime = user.banTime;

            if (banTime) {
                const hoursSinceBan = Math.ceil(
                    (currentTime.getTime() - banTime.getTime()) / 36e5 // 36e5 = 1 hour in milliseconds
                );

                if (hoursSinceBan <= 2) {
                    res.status(403).json({
                        success: false,
                        message: `User is banned. Ban time: ${hoursSinceBan} hours ago.`,
                    });
                    return;
                } else {
           
                    user.isBanned = false;
                    await user.save();
                }
            }
        }

     
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({
                success: false,
                message: "Incorrect credentials",
            });
            return;
        }

       
        const userInfo : UserDTO = {
            name: user.name,
            email: user.email,
            _id: user._id,
        };

        

        // Generate JWT token

        const token = generateToken({ userId: user.id, email: user.email });
        
        res.setHeader('Authorization', `Bearer ${token}`);
        res.cookie('auth_token', token, { httpOnly: true, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}`,
            token:token,
            user: userInfo,
        });

        
    } catch (err) {
        console.error("Error in login:", err);
        res.status(500).json({
            success: false,
            message: "Error logging in",
        });
    }
};



export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        
       
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Please enter all fields",
            });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
            return;
        }

        
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

       
        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (err) {
        console.error("Error in resetPassword:", err);
        res.status(500).json({
            success: false,
            message: "Error resetting password",
        });
    }
};

export const getCurrentUser = async (req: Request, res: Response) : Promise<void> => {
    const {email}  = req.body;

    const user = await User.findOne({email: email});

    if (!user) {
        res.status(404).json({
            success: false,
            message: "User not found",
        });
        return;
    }
    
    res.status(201).send({
        user: user
    })
}

export const editCurrentUser = async (req: Request, res: Response) : Promise<void> => {
    const userId = req.params;
    const {name}  = req.body;

    const user = await User.findById(userId)

    if (!user) {
        res.status(404).json({
            success: false,
            message: "User not found",
        });
        return;
    }

    user.name = name;
    await user.save();
    
    res.status(200).send({
        succes:true,
        message: "user updated succesfully!",
    })
}




