import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";

import "./DashboardLayout.css";

const DashboardLayout = () => {
    const location = useLocation();
    const pageMeta = location.pathname.includes("/requests/new")
        ? { title: "Create Request", subtitle: "Submit a new service request" }
        : location.pathname.includes("/requests/")
            ? { title: "Request Details", subtitle: "Review request information and activity" }
            : location.pathname.includes("/requests")
                ? { title: "Requests", subtitle: "Track and manage service requests" }
                : location.pathname.includes("/tasks")
                    ? { title: "Tasks", subtitle: "Organise and complete assigned work" }
                    : location.pathname.includes("/notifications")
                        ? { title: "Notifications", subtitle: "Stay up to date with SmartOps activity" }
                        : location.pathname.includes("/settings")
                            ? { title: "Settings", subtitle: "Manage your SmartOps profile" }
                            : location.pathname.includes("/staff")
                                ? { title: "Staff Management", subtitle: "Manage support staff and account status" }
                                : location.pathname.includes("/users")
                                    ? { title: "User Accounts", subtitle: "Manage regular employee accounts" }
                                    : location.pathname.includes("/departments")
                                        ? { title: "Departments", subtitle: "Manage request routing departments" }
                                        : location.pathname.includes("/categories")
                                            ? { title: "Categories", subtitle: "Manage request categories" }
                                            : location.pathname.includes("/reports")
                                                ? { title: "Reports", subtitle: "Review operational performance" }
                                                : location.pathname.includes("/analytics")
                                                    ? { title: "Analytics", subtitle: "Explore SmartOps activity" }
                                                    : location.pathname.includes("/feedback")
                                                        ? { title: "Feedback", subtitle: "Review employee feedback" }
                                                        : location.pathname.includes("/audit-logs")
                                                            ? { title: "Audit Logs", subtitle: "Review administrative activity" }
                                                            : location.pathname.includes("/ai-review")
                                                                ? { title: "AI Review", subtitle: "Review AI-assisted request suggestions" }
                                                                : { title: "Dashboard", subtitle: "Smart Operations & Service Management" };

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Navbar
                    title={pageMeta.title}
                    subtitle={pageMeta.subtitle}
                />

                <main className="dashboard-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
};

export default DashboardLayout;
