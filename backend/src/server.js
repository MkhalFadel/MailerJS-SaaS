require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const usersRoute = require("../routes/authRoutes");
const contactsRouter = require("../routes/contactsRoute");
const templatesRouter = require("../routes/templatesRoute");
const smtpRouter = require("../routes/smtpRouter");
const campaignRouter = require("../routes/campaignsRoutes");
const campaignRecipientRouter = require("../routes/campaignRecipientRouter");
const dashboardRouter = require("../routes/dashboardRoutes");
const errorHandler = require("../middleware/errorMiddleware");
const { generalApiLimiter } = require("../middleware/rateLimiters");
const prisma = require("../lib/prisma");
const { closeCampaignQueue } = require("../queues/campaignQueue");
const { closeRateLimitRedisConnection } = require("../queues/rateLimitRedis");
const { closeCampaignWorker } = require("../workers/campaignWorker");
const {
   startCampaignWorkerInApiProcess
} = require("../services/campaignWorkerRuntime");

const app = express();

const trustProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS, 10);

if(Number.isInteger(trustProxyHops) && trustProxyHops >= 0)
   app.set("trust proxy", trustProxyHops);

app.use(cors({
   origin: process.env.FRONTEND_URL || "http://localhost:5173",
   credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api", generalApiLimiter);

// Users route
app.use("/api/users", usersRoute);

// Contacts route
app.use('/api/contacts', contactsRouter);

// Template route
app.use("/api/templates", templatesRouter);

// SMTP route
app.use("/api/smtp", smtpRouter);

// Campaigns route
app.use("/api/campaigns", campaignRouter)

// Campaign Recipients route
app.use("/api/campaigns", campaignRecipientRouter);

// Dashboard route
app.use("/api/dashboard", dashboardRouter);

// Handle errors
app.use(errorHandler)

app.get("/", (req, res) => {
   res.json({
      message: "Backend running 🚀",
   });
});

const PORT = process.env.PORT || 5000;
let shuttingDown = false;

const server = app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);

   startCampaignWorkerInApiProcess().catch((error) => {
      console.error(
         "Campaign worker could not start inside API process:",
         error.message
      );
   });
});

async function shutdown(signal)
{
   if(shuttingDown)
      return;

   shuttingDown = true;
   console.info(`Server received ${signal}, shutting down`);

   server.close(async () => {
      try {
         await closeCampaignWorker();
         await closeCampaignQueue();
         await closeRateLimitRedisConnection();
         await prisma.$disconnect();
      } catch(error) {
         console.error("Server shutdown error:", error.message);
         process.exitCode = 1;
      }
   });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
