import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Campaign from "./pages/campaigns/Campaigns"
import Templates from "./pages/templates/Templates";


function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/campaigns" element={<Campaign />} />
      <Route path="/templates" element={<Templates />} />
    </Routes>
  );
}

export default App;