import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import RequesterDashboard from "./pages/RequesterDashboard";
import CreateRequest from "./pages/CreateRequest";
import BrowseRequests from "./pages/BrowseRequests";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Donor-only */}
          <Route
            path="/donor"
            element={
              <ProtectedRoute allowedRoles={["donor"]}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Requester-only */}
          <Route
            path="/requester"
            element={
              <ProtectedRoute allowedRoles={["requester"]}>
                <RequesterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/request-blood"
            element={
              <ProtectedRoute allowedRoles={["requester"]}>
                <CreateRequest />
              </ProtectedRoute>
            }
          />

          {/* Any logged-in donor or requester */}
          <Route
            path="/requests"
            element={
              <ProtectedRoute allowedRoles={["donor", "requester"]}>
                <BrowseRequests />
              </ProtectedRoute>
            }
          />

          {/* Admin — separate auth entirely, fixed credentials */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminPanel />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
