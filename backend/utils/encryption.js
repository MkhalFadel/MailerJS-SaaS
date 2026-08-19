const crypto = require("crypto");

function getEncryptionKey()
{
   const secretKey = process.env.SMTP_ENCRYPTION_KEY;

   if(!secretKey)
      throw new Error("SMTP_ENCRYPTION_KEY is not defined");

   return crypto.createHash("sha256").update(secretKey).digest();
}

function encryptText(value)
{
   const iv = crypto.randomBytes(12);
   const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
   const encrypted = Buffer.concat([
      cipher.update(String(value), "utf8"),
      cipher.final()
   ]);

   return Buffer.concat([
      iv,
      cipher.getAuthTag(),
      encrypted
   ]).toString("base64");
}

function decryptText(value)
{
   const buffer = Buffer.from(String(value), "base64");

   if(buffer.length < 28)
      throw new Error("Invalid encrypted SMTP password");

   const iv = buffer.subarray(0, 12);
   const authTag = buffer.subarray(12, 28);
   const encrypted = buffer.subarray(28);
   const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);

   decipher.setAuthTag(authTag);

   return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
   ]).toString("utf8");
}

module.exports = { encryptText, decryptText };
