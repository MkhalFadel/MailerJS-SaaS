const { encryptText } = require("./encryption");

function sanitizeSmtpAccount(account)
{
   if(!account)
      return account;

   const { password_encrypted, ...rest } = account;
   return rest;
}

function updateSmtpFields(data)
{
   const fields = {};

   if(data.provider?.trim()) fields.provider = data.provider.trim();
   if(data.host?.trim()) fields.host = data.host.trim();
   if(data.port !== undefined && data.port !== null && data.port !== "") fields.port = data.port;
   if(typeof data.secure === "boolean") fields.secure = data.secure;
   if(data.username?.trim()) fields.username = data.username.trim();

   if(data.password?.trim())
      fields.password_encrypted = encryptText(data.password.trim());

   if(typeof data.senderName === "string")
      fields.sender_name = data.senderName.trim();

   if(data.senderEmail?.trim()) fields.sender_email = data.senderEmail.trim();
   if(typeof data.isDefault === "boolean") fields.is_default = data.isDefault;

   return fields;
}

async function setDefaultSmtpAccount(tx, userId, targetId = null)
{
   if(targetId)
   {
      await tx.smtp_accounts.updateMany({
         where: {
            user_id: userId,
            id: {
               not: targetId
            },
            is_default: true
         },
         data: {
            is_default: false
         }
      });

      return;
   }

   await tx.smtp_accounts.updateMany({
      where: {
         user_id: userId,
         is_default: true
      },
      data: {
         is_default: false
      }
   });
}

module.exports = { updateSmtpFields, sanitizeSmtpAccount, setDefaultSmtpAccount };
