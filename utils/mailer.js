import nodemailer from 'nodemailer';

const config = {};

const initMailer = () => {
    if (config.transporter && config.from && config.to) {
        console.log("Mailer already initialized.");
        return;
    }
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_FROM || !process.env.EMAIL_TO) {
        console.warn("SMTP configuration is incomplete. Mailer will not be initialized.");
        return;
    }
    config.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    config.from = process.env.EMAIL_FROM;
    config.to = process.env.EMAIL_TO;
}

const sendEmail = async (subject, text, html, attachments) => {
    if (!config.transporter || !config.from || !config.to) {
        console.error('Mailer not initialized. Call initMailer() first.');
        return false;
    }
    if (!subject || !text || !html) {
        console.error('Subject, text, and html are required to send an email.');
        return false;
    }
    try {
        const message = {
            from: config.from,
            to: config.to,
            subject: subject,
            text: text,
            html: html,
        }
        if (attachments) message.attachments = attachments;

        const info = await config.transporter.sendMail(message);
        console.log('Email sent:', info);
        // Dev mode only
        if (process.env.NODE_ENV !== 'production' && process.env.SMTP_HOST === 'smtp.ethereal.email') {
            console.log('Preview URL: ', nodemailer.getTestMessageUrl(info));
        }
        
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const sendShippingLabels = async () => {
    const subject = `Shipping Labels`;
    const text = `Hello,\n\nPlease see the attached shipping labels for today's orders.`;
    const html = `<b>Hello,</b><br><br>Please see the attached shipping labels for today's orders.`;
    const attachments = [
        {
            filename: 'shippingLabels.csv',
            path: '../db/shippingLabels.csv',
        }
    ];

    return sendEmail(subject, text, html, attachments);
};

const sendErrorMessage = async () => {
    const subject = `Error occured - Shipping Labels`;
    const text = `Hello and uh oh,\n\nSomething happened when exporting today's shipping labels.`;
    const html = `<b>Hello and uh oh,</b><br><br>Something happened when exporting today's shipping labels.`;

    return sendEmail(subject, text, html);
};

export { initMailer, sendShippingLabels, sendErrorMessage };