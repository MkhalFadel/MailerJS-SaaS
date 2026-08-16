const prisma = require("../lib/prisma")
const { hashPassword, verifyPassword, generateRefreshToken, generateToken, updateUsersFields, verifyFields } = require("../utils/auth");

async function registerUsers(req, res)
{
   try {
      const data = req.body;
      const fields = verifyFields(data);
      
      if(fields)
         return res.status(400).json({
            message: "Required fields missing",
            fields: fields
         })

      const hashedPassword = await hashPassword(data.password)
      const user = await prisma.users.create({
         data:{
            email: data.email,
            password_hash: hashedPassword,
            first_name: data.firstName,
            last_name: data.lastName,
         }
      })

      const { password_hash, ...rest } = user;
      return res.status(201).json({
         message: "User created successfully",
         data: rest
      })
   } catch (error) {
      if(error.code === "P2002")
         return res.status(409).json({
            error: "Email already exists"
         })
      
      return res.status(500).json({
         error: "Error creating user"
      })
   }
}

async function login(req, res)
{
   try {
      const { email, password } = req.body;

      const user = await prisma.users.findUnique({
         where:{
            email: email
         }
      })

      if(!user) return res.status(401).json({error: "Invalid Credentials"});

      const checkPassword = await verifyPassword(password, user.password_hash);

      if(!checkPassword) return res.status(401).json({error: "Invalid Credentials"});

      const payload = { id: user.id, email: user.email }

      const accessToken = generateToken(payload);
      const refreshToken = generateRefreshToken(payload);

      const cookieOptions = {
         httpOnly: true,
         secure: false,
         sameSite: "lax"
      };

      res.cookie("authToken", accessToken, {
         ...cookieOptions,
         maxAge: 60 * 60 * 1000
      })

      res.cookie("refreshToken", refreshToken, {
         ...cookieOptions,
         maxAge: 7 * 24 * 60 * 60 * 1000
      })

      const { password_hash, ...rest } = user;

      return res.status(200).json({
         message: "Login successful", user: rest, accessToken
      })

   } catch (error) {
      console.log("Login error: ", error);
      return res.status(500).json({
         error: "Server Error"
      })
   }
}

async function updateUser(req, res)
{
   try {
      const data = req.body;
      const { id } = req.user
      const fields = updateUsersFields(data)

      if(Object.keys(fields).length === 0)
         return res.status(400).json({
            error: "No fields to update"
         });

      const user = await prisma.users.update({
         where: {
            id: id
         },
         data: fields
      })

      const { password_hash, ...rest} = user;
      return res.status(200).json({
         message: "Info updated successfully",
         data: rest
      })

   } catch (error) {
      return res.status(500).json({
         error: "Internal server error"
      })
   }
}

async function deleteUser(req, res)
{
   try {
      const { id } = req.user
      await prisma.users.delete({
         where:{
            id: id
         }
      })
      
      return res.status(204).send()
   } catch (error) {
      return res.status(500).json({
         error: "Internal server error"
      })
   }
}

module.exports = { login, registerUsers, updateUser, deleteUser }