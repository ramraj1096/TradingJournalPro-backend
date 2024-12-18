import NodeCache from "node-cache";
import nodemailer from "nodemailer";
import { Request, Response,  } from "express";
import User from "../models/user";
import { blockTemplate, loginTemplate, registerTemplate } from "../utils/template";

// Initialize NodeCache (without type argument)
const otpCache = new NodeCache({ stdTTL: 300 });

const generateOtp = (key: string): string => {
    const min = 100000;
    const max = 999999;

    const otp = Math.floor(Math.random() * (max - min + 1)) + min;

    otpCache.set(key, otp.toString());

    return otp.toString();
};



const getOtp = (key: string): string => {
    const otp = otpCache.get<string>(key);

    if (!otp) return ""; 

    return otp; 
}

const clearOtp = (key: string): void => {
    otpCache.del(key);
}


//send email
interface SendOtpRequestBody {
    email: string;
    useCase: string;
    isLogin?: boolean;
    name?: string;
}

interface SendEmailProps {
    email: string;
    name: string;
    otp: string;
    useCase: string;
}


export const sendEmail = async (
    { email, name, otp, useCase }: SendEmailProps,
    res: Response
): Promise<void> => {
    try {
        let htmlTemplate = `<h1>Error</h1>`;
        let subjectMessage = "";

        // Prepare HTML template and subject based on useCase
        if (useCase === "register") {

            subjectMessage = "OTP for Registering - TradingJournalPro!";
            htmlTemplate = registerTemplate(name, otp);

        }
         else if (useCase === "login") {

            subjectMessage = "OTP for Login - TradingJournalPro!";
            htmlTemplate = loginTemplate(otp, name);

        } 
         else if (useCase === "resetPassword") {
            
            subjectMessage = "OTP for Resetting Password - TradingJournalPro!";
            htmlTemplate = `
                <div>
                    <p>Hi ${name},</p>
                    <p>Your OTP for resetting your password is:</p>
                    <h2>${otp}</h2>
                </div>`;
        } else {
            subjectMessage = "Account Blocked! - TradingJournalPro";
            htmlTemplate = blockTemplate(name);
        }

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST as string,
            port: 465,
            secure: true,
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER as string,
                pass: process.env.MAIL_PASS as string,
            },
        });

        const mailOptions = {
            to: email,
            subject: subjectMessage,
            html: htmlTemplate,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
            console.log("Email sent:", info.messageId);
            return res.status(200).json({
                success: true,
                message: "Email sent successfully!",
            });
        });
    } catch (err: any) {
        console.error("Error in sendEmail:", err);
         res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};



export const sendOtp = async (
    req: Request<{}, {}, SendOtpRequestBody>,
    res: Response
): Promise<void> => {
    try {
        const { email, useCase, isLogin, name } = req.body;

        if (!email) {
             res.status(400).json({
                success: false,
                message: "Please provide an email address.",
            });
            return;
        }

        const userExists = await User.findOne({ email });
        
        let userName = name;

        if (!isLogin) {
            if (userExists) {
                
                 res.status(409).json({
                    success: false,
                    message: "User already exists.",
                });
                console.log("User exists")
                return;
            }
        } else {
            if (!userExists) {
                 res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
                return;
            }
            userName = userExists?.name;
        }

        const otp = generateOtp(email);
        console.log("Generated OTP:", otp);

        await sendEmail(
            { email, name: userName || email, otp, useCase },
            res
        );
        
        type OtpResponse = {
            otp: string;
            options?: string[];
          };
          
          const otpResponse: OtpResponse = { otp };
          
          if (isLogin) {
            const options: string[] = [];
            const min = 100000;
            const max = 999999;
          
            for (let i = 0; i < 3; i++) {
              const currentOtp = Math.floor(Math.random() * (max - min + 1)) + min;
              options.push(currentOtp.toString());
            }
          
            options.push(otp);
          
            for (let i = options.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [options[i], options[j]] = [options[j], options[i]];
            }
          
            otpResponse.options = options; 
          }
          
           res.status(200).json({
            success: true,
            otpInfo: otpResponse,
            
            message: "OTP sent successfully",
          });
          return;
          
    } catch (err: any) {
        console.error("Error in sendOtp:", err.message);
         res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        // Destructuring and typing req.body
        const {
            email,
            otp,
            isBanAllowed,
        }: { email: string; otp: string; isBanAllowed?: boolean } = req.body;

        // Error handling for missing email or OTP
        if (!email || !otp) {
            res.status(400).json({
                success: false,
                message: "Please provide email and OTP.",
            });
            return;
        }

        // Converting the user-entered OTP to integer
        const userOtp = parseInt(otp, 10);

        // Fetching the correct OTP from cache
        const correctOtp = getOtp(email);

        console.log({
            email: email,
            userOTP: userOtp,
            correctOTP: correctOtp,
        });

        // Handling expired or missing OTP
        if (!correctOtp) {
            res.status(400).json({
                success: false,
                message: "OTP is expired.",
            });
            return;
        }

        const isValid = userOtp === parseInt(correctOtp, 10);

        if (isValid) {
            clearOtp(email);
             res.status(200).json({
                success: true,
                message: "OTP Verified Successfully",
            });
            return;
        } else if (isBanAllowed) {
            const user = await User.findOne({email : email});
            if (user) {
                const { name } = user;

                user.isBanned = true;
                await user.save();

                await sendEmail(
                    {
                        email: email,
                        name: name,
                        otp: "",
                        useCase: "blockEmail",
                    },
                    res
                );
                

                 res.status(200).json({
                    success: false,
                    message: "Invalid OTP! Your account has been blocked!",
                });
                return;
            }
        }

         res.status(200).json({
            success: false,
            message: "Invalid OTP.",
        });
        return;
    } catch (err: any) {
         res.status(500).json({
            success: false,
            message: err.message,
        });
        return;
    }
};
