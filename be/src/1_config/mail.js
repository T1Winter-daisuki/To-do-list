import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTP = async (toEmail, otpCode) => {
    try {
        const mailOptions = {
            from: `"To-Do App" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Mã xác thực tài khoản To-Do App',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                    <h2>Chào mừng bạn đến với Self-help place!</h2>
                    <p>Mã xác thực (OTP) của bạn là:</p>
                    <h1 style="color: #B6AE9F; font-size: 40px; letter-spacing: 5px;">${otpCode}</h1>
                    <p>Mã này sẽ hết hạn trong vòng 1 phút.</p>
                    <p>Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
        return false;
    }
};