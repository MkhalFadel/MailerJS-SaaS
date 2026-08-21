const nodemailer = require("nodemailer");
const { decryptText } = require("../utils/encryption");

function createTransporter(data)
{
   const decryptedPassword = decryptText(data.password_encrypted);

   return nodemailer.createTransport({
      host: data.host,
      port: data.port,
      secure: data.secure,
      auth: {
         user: data.username,
         pass: decryptedPassword
      }
   });
}

async function testConnection(data)
{
   const transporter = createTransporter(data);

   return await transporter.verify();
}

async function sendEmail(transporter, data)
{
   return await transporter.sendMail({
      from: {
         name: data.senderName || data.senderEmail,
         address: data.senderEmail
      },
      to: data.recipient,
      subject: data.subject,
      html: data.html
   });
}

module.exports = { createTransporter, testConnection, sendEmail };