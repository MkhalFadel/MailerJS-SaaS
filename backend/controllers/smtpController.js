const prisma = require("../lib/prisma");
const { updateSmtpFields, sanitizeSmtpAccount, setDefaultSmtpAccount } = require("../utils/smtp");

async function fetchSmtpAccounts(req, res, next)
{
   try {
      const userId = req.user.id;

      const smtpAccounts = await prisma.smtp_accounts.findMany({
         where: {
            user_id: userId
         }
      });

      const safeAccounts = smtpAccounts.map((account) => sanitizeSmtpAccount(account));

      return res.status(200).json({
         message: "SMTP accounts fetched!",
         data: safeAccounts
      });
   } catch (error) {
      next(error);
   }
}

async function createSmtpAccount(req, res, next)
{
   try {
      const user_id = req.user.id;
      const data = req.body;
      const fields = updateSmtpFields(data);

      const smtpAccountData = {
         user_id,
         provider: data.provider,
         host: data.host,
         port: data.port,
         secure: data.secure ?? false,
         username: data.username,
         password_encrypted: fields.password_encrypted,
         sender_name: data.senderName || null,
         sender_email: data.senderEmail,
         is_default: data.isDefault ?? false
      };

      const accountCount = await prisma.smtp_accounts.count({
         where: {
            user_id
         }
      });

      if(accountCount === 0)
         smtpAccountData.is_default = true;

      let smtpAccount;

      if(smtpAccountData.is_default)
      {
         await prisma.$transaction(async (tx) => {
            await setDefaultSmtpAccount(tx, user_id);
            smtpAccount = await tx.smtp_accounts.create({
               data: smtpAccountData
            });
         });
      } else {
         smtpAccount = await prisma.smtp_accounts.create({
            data: smtpAccountData
         });
      }

      return res.status(201).json({
         message: "SMTP account created successfully",
         data: sanitizeSmtpAccount(smtpAccount)
      });
   } catch (error) {
      next(error);
   }
}

async function updateSmtpAccount(req, res, next)
{
   try {
      const { id } = req.params;
      const data = req.body;
      const fields = updateSmtpFields(data);

      if(Object.keys(fields).length === 0)
         return res.status(400).json({
            error: "No fields to update"
         });

      const smtpAccount = await prisma.smtp_accounts.findFirst({
         where: {
            id: id,
            user_id: req.user.id
         }
      });

      if(!smtpAccount)
         return res.status(404).json({
            error: "SMTP account not found"
         });

      let updatedSmtpAccount;

      if(fields.is_default === true)
      {
         await prisma.$transaction(async (tx) => {
            await setDefaultSmtpAccount(tx, req.user.id, smtpAccount.id);
            updatedSmtpAccount = await tx.smtp_accounts.update({
               where: {
                  id: smtpAccount.id
               },
               data: fields
            });
         });
      } else {
         updatedSmtpAccount = await prisma.smtp_accounts.update({
            where: {
               id: smtpAccount.id
            },
            data: fields
         });
      }

      return res.status(200).json({
         message: "SMTP account updated successfully",
         data: sanitizeSmtpAccount(updatedSmtpAccount)
      });
   } catch (error) {
      next(error);
   }
}

async function deleteSmtpAccount(req, res, next)
{
   try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await prisma.smtp_accounts.deleteMany({
         where: {
            id: id,
            user_id: userId
         }
      });

      if(result.count === 0)
      {
         return res.status(404).json({
            error: "SMTP account not found"
         });
      }

      return res.status(204).send();
   } catch (error) {
      next(error);
   }
}

module.exports = { fetchSmtpAccounts, createSmtpAccount, updateSmtpAccount, deleteSmtpAccount };
