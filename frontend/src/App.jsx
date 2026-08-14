import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Campaign from "./pages/campaigns/Campaigns"
import Templates from "./pages/templates/Templates";
import Contacts from './pages/contacts/Contacts'
import Settings from "./pages/settings/Settings";
import Login from "./pages/auth/login/Login";
import Register from "./pages/auth/register/Register";
import ForgetPassword from "./pages/auth/forgetPassword/ForgetPassword";
import ResetPassword from "./pages/auth/resetPassword/ResetPassword";
import Account from "./pages/account/Account";

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/campaigns" element={<Campaign />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/account" element={<Account />} />
    </Routes>
  );
}

export default App;