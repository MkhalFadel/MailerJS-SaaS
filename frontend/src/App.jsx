import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Campaign from "./pages/campaigns/Campaigns"
import Templates from "./pages/templates/Templates";
import Contacts from './pages/contacts/Contacts'
import Settings from "./pages/settings/Settings";


function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/campaigns" element={<Campaign />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;