const nodemailer = require('nodemailer');

const getTransporter = () => {
    if (process.env.EMAIL_HOST) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '465', 10),
            secure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendOtpEmail = async (email, otp) => {
    const transporter = getTransporter();
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    const mailOptions = {
        from,
        to: email,
        subject: 'Password Reset OTP - Suffix',
        text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
        html: `<h3>Password Reset OTP</h3><p>Your OTP for password reset is: <strong>${otp}</strong></p><p>It is valid for 10 minutes.</p>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`, { messageId: info.messageId });
    } catch (error) {
        console.error('Error sending email:', {
            name: error.name,
            code: error.code,
            response: error.response,
            message: error.message
        });
        throw new Error('Failed to send OTP email');
    }
};

module.exports = { sendOtpEmail };
