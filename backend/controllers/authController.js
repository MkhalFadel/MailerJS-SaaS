const prisma = require("../lib/prisma")
const {
   hashPassword,
   verifyPassword,
   updateUsersFields,
   verifyRefreshToken,
   setAuthCookies,
   setAccessTokenCookie,
   clearAuthCookies
} = require("../utils/auth");
const { verifyGoogleCredential } = require("../services/googleAuthService");

function serializeUser(user)
{
   const { password_hash, ...rest } = user;

   return {
      ...rest,
      hasPassword: Boolean(password_hash)
   };
}

function getPasswordValidationError(password)
{
   if(typeof password !== "string" || password.length < 8)
      return "Password must contain at least 8 characters";

   if(!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password))
      return "Password must contain uppercase, lowercase, and a number";

   return null;
}

function getGoogleProfileNames(profile)
{
   const nameParts = profile.name?.trim().split(/\s+/) || [];

   return {
      firstName: profile.given_name?.trim() || nameParts[0] || "Google",
      lastName: profile.family_name?.trim() || nameParts.slice(1).join(" ") || "User"
   };
}

async function fetchUser(req, res, next)
{
   try {
      const { id } = req.user;

      const user = await prisma.users.findUnique({
         where: {
            id: id
         }
      })

      if(!user)
         return res.status(404).json({
            error: "User not found"
         });

      return res.status(200).json({
         data: serializeUser(user)
      })
   } catch (error) {
      next(error)
   }
}

async function registerUsers(req, res, next)
{
   try {
      const data = req.body;

      const hashedPassword = await hashPassword(data.password)
      const user = await prisma.users.create({
         data:{
            email: data.email.trim(),
            password_hash: hashedPassword,
            first_name: data.firstName.trim(),
            last_name: data.lastName.trim(),
         }
      })

      return res.status(201).json({
         message: "User created successfully",
         data: serializeUser(user)
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

async function login(req, res, next)
{
   try {
      const { email, password } = req.body;

      const user = await prisma.users.findUnique({
         where:{
            email: email
         }
      })

      if(!user || !user.password_hash)
         return res.status(401).json({error: "Invalid Credentials"});

      const checkPassword = await verifyPassword(password, user.password_hash);

      if(!checkPassword) return res.status(401).json({error: "Invalid Credentials"});

      setAuthCookies(res, user);

      return res.status(200).json({
         message: "Login successful", user: serializeUser(user)
      })

   } catch (error) {
      next(error)
   }
}

async function updateUser(req, res, next)
{
   try {
      const data = req.body;
      const { id } = req.user;

      if(data.password)
      {
         return res.status(400).json({
            error: "Use the password endpoint to update your password"
         });
      }

      const fields = await updateUsersFields(data)

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

      return res.status(200).json({
         message: "Info updated successfully",
         data: serializeUser(user)
      })

   } catch (error) {
      next(error)
   }
}

async function updatePassword(req, res, next)
{
   try {
      const {
         currentPassword,
         newPassword,
         confirmPassword,
         googleCredential
      } = req.body;
      const user = await prisma.users.findUnique({
         where: {
            id: req.user.id
         },
         select: {
            id: true,
            email: true,
            password_hash: true,
            google_id: true,
            first_name: true,
            last_name: true,
            created_at: true,
            updated_at: true
         }
      });

      if(!user)
      {
         return res.status(404).json({
            error: "User not found"
         });
      }

      const passwordError = getPasswordValidationError(newPassword);

      if(passwordError)
         return res.status(400).json({ error: passwordError });

      if(newPassword !== confirmPassword)
      {
         return res.status(400).json({
            error: "New password and confirmation do not match"
         });
      }

      if(user.password_hash)
      {
         if(!currentPassword)
         {
            return res.status(400).json({
               error: "Current password is required"
            });
         }

         const isCurrentPasswordValid = await verifyPassword(
            currentPassword,
            user.password_hash
         );

         if(!isCurrentPasswordValid)
         {
            return res.status(400).json({
               error: "Current password is incorrect"
            });
         }
      } else {
         if(!user.google_id)
         {
            return res.status(400).json({
               error: "Password setup is unavailable for this account"
            });
         }

         try {
            const profile = await verifyGoogleCredential(googleCredential);

            if(profile.sub !== user.google_id)
            {
               return res.status(403).json({
                  error: "Google reauthentication does not match this account"
               });
            }
         } catch(error) {
            if(error.code === "GOOGLE_AUTH_NOT_CONFIGURED")
            {
               return res.status(503).json({
                  error: "Google reauthentication is not configured"
               });
            }

            if(error.code === "GOOGLE_AUTH_INVALID")
            {
               return res.status(401).json({
                  error: "Google reauthentication could not be verified"
               });
            }

            throw error;
         }
      }

      const password_hash = await hashPassword(newPassword);
      const updatedUser = await prisma.users.update({
         where: {
            id: user.id
         },
         data: {
            password_hash
         }
      });

      return res.status(200).json({
         message: user.password_hash
            ? "Password changed successfully"
            : "Password set successfully",
         data: serializeUser(updatedUser)
      });
   } catch(error) {
      next(error);
   }
}

async function verifyGoogleReauthentication(req, res, next)
{
   try {
      const credential = req.body?.credential;

      if(!credential)
      {
         return res.status(400).json({
            error: "Google credential is required"
         });
      }

      const profile = await verifyGoogleCredential(credential);
      const user = await prisma.users.findUnique({
         where: {
            id: req.user.id
         },
         select: {
            google_id: true
         }
      });

      if(!user)
      {
         return res.status(404).json({
            error: "User not found"
         });
      }

      if(!user.google_id)
      {
         return res.status(400).json({
            error: "Google reauthentication is unavailable for this account"
         });
      }

      if(profile.sub !== user.google_id)
      {
         return res.status(403).json({
            error: "Please verify using the Google account connected to this MailerJS account."
         });
      }

      return res.status(200).json({
         verified: true
      });
   } catch(error) {
      if(error.code === "GOOGLE_AUTH_NOT_CONFIGURED")
      {
         return res.status(503).json({
            error: "Google reauthentication is not configured"
         });
      }

      if(error.code === "GOOGLE_AUTH_INVALID")
      {
         return res.status(401).json({
            error: "Google reauthentication could not be verified"
         });
      }

      next(error);
   }
}

async function deleteUser(req, res, next)
{
   try {
      const { id } = req.user
      await prisma.users.delete({
         where:{
            id: id
         }
      })

      clearAuthCookies(res);
      
      return res.status(204).send()
   } catch (error) {
      return res.status(500).json({
         error: "Internal server error"
      })
   }
}

async function updateAccessToken(req, res, next)
{
   const refreshToken = req.cookies.refreshToken;

   if(!refreshToken)
   {
      clearAuthCookies(res);

      return res.status(401).json({
         error: "Refresh token required",
         code: "REFRESH_TOKEN_MISSING"
      });
   }

   try {
      const { id } = verifyRefreshToken(refreshToken);
      const user = await prisma.users.findUnique({
         where: {
            id
         },
         select: {
            id: true,
            email: true
         }
      });

      if(!user)
      {
         clearAuthCookies(res);

         return res.status(401).json({
            error: "Refresh token is no longer valid",
            code: "REFRESH_TOKEN_INVALID"
         });
      }

      setAccessTokenCookie(res, user);

      return res.status(200).json({
         message: "Access token refreshed"
      });

   } catch(error) {
      clearAuthCookies(res);

      return res.status(401).json({
         error: "Invalid refresh token",
         code: "REFRESH_TOKEN_INVALID"
      });
   }
}

async function googleLogin(req, res, next)
{
   try {
      const profile = await verifyGoogleCredential(req.body?.credential);
      const googleId = profile.sub;
      const email = profile.email.trim().toLowerCase();
      let user = await prisma.users.findUnique({
         where: {
            google_id: googleId
         }
      });

      if(!user)
      {
         const existingEmailUser = await prisma.users.findFirst({
            where: {
               email: {
                  equals: email,
                  mode: "insensitive"
               }
            }
         });

         if(existingEmailUser)
         {
            return res.status(409).json({
               error: "An account with this email already exists. Sign in with your existing method to link Google later."
            });
         }

         const { firstName, lastName } = getGoogleProfileNames(profile);
         user = await prisma.users.create({
            data: {
               email,
               google_id: googleId,
               first_name: firstName,
               last_name: lastName
            }
         });
      }

      setAuthCookies(res, user);

      return res.status(200).json({
         message: "Google sign-in successful",
         user: serializeUser(user)
      });
   } catch(error) {
      if(error.code === "GOOGLE_AUTH_NOT_CONFIGURED")
      {
         return res.status(503).json({
            error: "Google sign-in is not configured"
         });
      }

      if(error.code === "GOOGLE_AUTH_INVALID")
      {
         return res.status(401).json({
            error: "Google sign-in could not be verified"
         });
      }

      if(error.code === "P2002")
      {
         return res.status(409).json({
            error: "Unable to create a Google account with this identity"
         });
      }

      next(error);
   }
}

function logout(req, res, next)
{
   clearAuthCookies(res);

   return res.status(200).json({
      message: "Logout successful"
   })
}

module.exports = {
   login,
   registerUsers,
   updateUser,
   updatePassword,
   verifyGoogleReauthentication,
   deleteUser,
   fetchUser,
   updateAccessToken,
   googleLogin,
   logout
}
