import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import UserDashboard from "./pages/user/UserDashboard";
import MyRequests from "./pages/user/MyRequests";
import CreateRequest from "./pages/user/CreateRequest";
import RequestDetails from "./pages/user/RequestDetails";

import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffRequests from "./pages/staff/StaffRequests";
import StaffTasks from "./pages/staff/StaffTasks";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminReports from "./pages/admin/AdminReports";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminAIReview from "./pages/admin/AdminAIReview";

import Notifications from "./pages/Notifications";

import Settings from "./pages/shared/Settings";

import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import { useAuth } from "./context/AuthContext";



function App() {

    const { user } = useAuth();

    return (
        <Routes>

            <Route
                path="/"
                element={
                    user
                        ? <Navigate to={`/${user.role}`} replace />
                        : <Navigate to="/login" replace />
                }
            />

            <Route
                path="/login"
                element={
                    user
                        ? <Navigate to={`/${user.role}`} replace />
                        : <Login />
                }
            />

            <Route
                path="/register"
                element={
                    user
                        ? <Navigate to={`/${user.role}`} replace />
                        : <Register />
                }
            />

             <Route
                    path="/user"
                    element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={<UserDashboard />}
                    />

                     <Route
                         path="requests"
                          element={<MyRequests />}
                     />

                         <Route
                           path="requests/new"
                           element={<CreateRequest />}
                       />

                      <Route
                           path="requests/:id"
                           element={<RequestDetails />}
                      />

                      <Route path="notifications" element={<Notifications />} />
                      <Route path="settings" element={<Settings />} />



                </Route>
                
                   <Route
                    path="/staff"
                    element={
                        <ProtectedRoute allowedRoles={["staff"]}>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                   >
                    <Route
                        index
                        element={<StaffDashboard />}
                    />
                    <Route
                        path="requests"
                        element={<StaffRequests />}
                    />
                    <Route
                        path="requests/:id"
                        element={<RequestDetails />}
                    />
                    <Route
                        path="tasks"
                        element={<StaffTasks/>}
                    />

                 <Route path="notifications" element={<Notifications />} />
                 <Route path="settings" element={<Settings />} />

                </Route>
                
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={<AdminDashboard />}
                    />
                    <Route
                        path="requests"
                        element={<AdminRequests />}
                    />
                    <Route
                        path="requests/:id"
                        element={<RequestDetails />}
                    />
                    <Route
                        path="ai-review/:requestId"
                        element={<AdminAIReview />}
                    />
                    <Route
                        path="staff"
                        element={<AdminStaff />}
                    />
                    <Route
                        path="tasks"
                        element={<AdminTasks/>}
                    />
                   
                   <Route
                         path="departments"
                         element={<AdminDepartments />}
                     />

                     <Route
                          path="categories"
                          element={<AdminCategories />}
                      />

                    <Route
                        path="reports"
                        element={<AdminReports />}
                    />

                    <Route
                        path="analytics"
                        element={<AdminAnalytics />}
                    />

                    <Route
                        path="audit-logs"
                        element={<AdminAuditLogs />}
                    />

                    <Route
                        path="feedback"
                        element={<AdminFeedback />}
                    />

                    <Route path="notifications" element={<Notifications />} />
                    <Route path="settings" element={<Settings />} />
                    
                </Route>



        </Routes>
    );
}

export default App;
