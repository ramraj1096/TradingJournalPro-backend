export const registerTemplate = (name: string, otp: string): string => `
    <div style="font-family: Helvetica, Arial, sans-serif; min-width: 300px; max-width: 600px; margin: auto; padding: 20px; background-color: #f0f8ff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                <a href="#" style="font-size: 1.5em; color: #007bff; text-decoration: none; font-weight: bold;">TradingJournalPro</a>
            </div>
            <p style="font-size: 1.1em; margin: 20px 0; color: #333;">Hi ${name},</p>
            <p style="font-size: 1em; color: #333;">Thank you for registering with <strong>TradingJournalPro</strong>! Use the OTP below to complete your registration. The OTP is valid for 5 minutes.</p>
            <h2 style="background: linear-gradient(90deg, #007bff, #00466a); margin: 20px auto; width: fit-content; padding: 12px 25px; color: white; border-radius: 6px; text-align: center; font-size: 1.5em;">${otp}</h2>
            <p style="font-size: 0.9em; color: #777; margin-top: 20px;">Regards,<br />The TradingJournalPro Team</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <div style="text-align: center; color: #888; font-size: 0.8em;">
                <p>TradingJournalPro Inc, 1234 Finance St, New York, NY 10001</p>
            </div>
        </div>
    </div>
`;

export const loginTemplate = (name: string, otp: string): string => `
    <div style="font-family: Helvetica, Arial, sans-serif; min-width: 300px; max-width: 600px; margin: auto; padding: 20px; background-color: #f0f8ff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                <a href="#" style="font-size: 1.5em; color: #007bff; text-decoration: none; font-weight: bold;">TradingJournalPro</a>
            </div>
            <p style="font-size: 1.1em; margin: 20px 0; color: #333;">Hi ${otp},</p>
            <p style="font-size: 1em; color: #333;">Thank you for choosing <strong>TradingJournalPro</strong>. Use the OTP below to complete your login. The OTP is valid for 5 minutes.</p>
            <h2 style="background: linear-gradient(90deg, #007bff, #00466a); margin: 20px auto; width: fit-content; padding: 12px 25px; color: white; border-radius: 6px; text-align: center; font-size: 1.5em;">${name}</h2>
            <p style="font-size: 0.9em; color: #777; margin-top: 20px;">Regards,<br />The TradingJournalPro Team</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <div style="text-align: center; color: #888; font-size: 0.8em;">
                <p>TradingJournalPro Inc, 1234 Finance St, New York, NY 10001</p>
            </div>
        </div>
    </div>
`;

export const blockTemplate = (name: string): string => `
    <div style="font-family: Helvetica, Arial, sans-serif; min-width: 300px; max-width: 600px; margin: auto; padding: 20px; background-color: #f0f8ff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                <a href="#" style="font-size: 1.5em; color: #007bff; text-decoration: none; font-weight: bold;">TradingJournalPro</a>
            </div>
            <p style="font-size: 1.1em; margin: 20px 0; color: #333;">Hi ${name},</p>
            <p style="font-size: 1em; color: #333;">There has been a failed login attempt. Your account has been temporarily blocked for 2 hours for security purposes.</p>
            <p style="font-size: 0.9em; color: #777; margin-top: 20px;">Regards,<br />The TradingJournalPro Team</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <div style="text-align: center; color: #888; font-size: 0.8em;">
                <p>TradingJournalPro Inc, 1234 Finance St, New York, NY 10001</p>
            </div>
        </div>
    </div>
`;
