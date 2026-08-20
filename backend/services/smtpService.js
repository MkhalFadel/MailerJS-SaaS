const nodemailer = require("nodemailer");
const { decryptText } = require("../utils/encryption");

function createTransporter(data)
{
   const decryptedPassword = decryptText(data.password_encrypted)

   const transporter = nodemailer.createTransport({
      host: data.host,
      port: data.port,
      secure: data.secure,
      auth: {
         user: data.username,
         pass: decryptedPassword
      }
   });

   return transporter;
}

async function testConnection(data)
{
   const transporter = createTransporter(data);

   return await transporter.verify();
}

module.exports = { testConnection, createTransporter };

