require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const usersRoute = require("../routes/authRoutes");
const contactsRouter = require("../routes/contactsRoute");
const errorHandler = require("../middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Users route
app.use("/api/users", usersRoute);

// Contacts route
app.use('/api/contacts', contactsRouter);

// Handle errors
app.use(errorHandler)

app.get("/", (req, res) => {
   res.json({
      message: "Backend running 🚀",
   });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});