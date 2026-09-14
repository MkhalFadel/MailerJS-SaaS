const { getDashboard } = require("../services/dashboardService");

async function fetchDashboard(req, res, next)
{
   try {
      const dashboard = await getDashboard(req.user.id);

      return res.status(200).json({
         message: "Dashboard fetched!",
         data: dashboard
      });
   } catch(error) {
      next(error);
   }
}

module.exports = { fetchDashboard };
