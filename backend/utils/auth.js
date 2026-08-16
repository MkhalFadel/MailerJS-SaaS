const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

async function hashPassword(password)
{
   const salt = 12;
   const hashedPassword = await bcrypt.hash(password, salt);
   return hashedPassword; 
}

async function verifyPassword(password, storedHash)
{
   const match = await bcrypt.compare(password, storedHash)
   return match;
}

function generateToken(payload)
{
   const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
   return token;
}

function generateRefreshToken(payload)
{
   const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: "7d" });
   return refreshToken;
}

function verifyToken(token)
{
   return jwt.verify(token, process.env.JWT_SECRET);
}

function verifyRefreshToken(token)
{
   return jwt.verify(token, process.env.REFRESH_SECRET)
}

function updateUsersFields(data)
{
   const fields = {};
   if(data.email) fields.email = data.email;
   if(data.firstName) fields.first_name = data.firstName;
   if(data.lastName) fields.last_name = data.lastName;
   if(data.password) fields.password_hash = hashPassword(data.password)

   return fields;
}

function verifyFields(data)
{
   const fields = {};
   
   if(!data.email?.trim())
      fields.email = "Email cannot be empty";
   
   if(!data.firstName?.trim())
      fields.firstName = "First name cannot be empty";
   
   if(!data.lastName?.trim())
      fields.lastName = "Last name cannot be empty"
   
   if(!data.password?.trim())
      fields.password = "Password cannot be empty"

   return Object.keys(fields).length === 0 ? false : fields
}

module.exports = { hashPassword, verifyPassword, generateToken, generateRefreshToken, verifyToken, verifyRefreshToken, updateUsersFields, verifyFields }