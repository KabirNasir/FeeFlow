// // backend/utils/sendEmail.js
// // import { createTransport } from 'nodemailer';
// const nodemailer = require('nodemailer');

// // const sendEmail = async (options) => {
// //     const transporter = createTransport({
// //         host: process.env.SMTP_HOST,
// //         port: process.env.SMTP_PORT,
// //         auth: {
// //             user: process.env.SMTP_EMAIL,
// //             pass: process.env.SMTP_PASSWORD,
// //         },
// //     });

// //     const message = {
// //         from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
// //         to: options.email,
// //         subject: options.subject,
// //         text: options.message,
// //     };

// //     await transporter.sendMail(message);
// // };

// const sendEmail = async (options) => {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail', // Use the built-in Gmail service
//         auth: {
//             user: process.env.SMTP_EMAIL,
//             pass: process.env.SMTP_PASSWORD, // This MUST be the 16-digit App Password
//         },
//     });

//     const message = {
//         from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`, // Use your Gmail here
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//     };

//     await transporter.sendMail(message);
//   };

// export default sendEmail;


const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD, 
        },
    });

    const message = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`, 
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(message);
};

module.exports = sendEmail;