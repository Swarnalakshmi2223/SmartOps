import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";

import "./DashboardLayout.css";

const pageMetaRules = [
    ["/requests/new", { title: "Create Request", subtitle: "Submit a new service request" }],
    ["/requests/", { title: "Request Details", subtitle: "Review request information and activity" }],
    ["/requests", { title: "Requests", subtitle: "Track and manage service requests" }],
    ["/tasks", { title: "Tasks", subtitle: "Organise and complete assigned work" }],
    ["/notifications", { title: "Notifications", subtitle: "Stay up to date with SmartOps activity" }],
    ["/settings", { title: "Settings", subtitle: "Manage your SmartOps profile" }],
    ["/staff", { title: "Staff Management", subtitle: "Manage support staff and account status" }],
    ["/users", { title: "User Accounts", subtitle: "Manage regular employee accounts" }],
    ["/departments", { title: "Departments", subtitle: "Manage request routing departments" }],
    ["/categories", { title: "Categories", subtitle: "Manage request categories" }],
    ["/reports", { title: "Reports", subtitle: "Review operational performance" }],
    ["/analytics", { title: "Analytics", subtitle: "Explore SmartOps activity" }],
    ["/feedback", { title: "Feedback", subtitle: "Review employee feedback" }],
    ["/audit-logs", { title: "Audit Logs", subtitle: "Review administrative activity" }],
    ["/ai-review", { title: "AI Review", subtitle: "Review AI-assisted request suggestions" }]
];

const getPageMeta = (pathname) => {
    const matchingRule = pageMetaRules.find(([pathSegment]) =>
        pathname.includes(pathSegment)
    );

    return matchingRule?.[1] || {
        title: "Dashboard",
        subtitle: "Smart Operations & Service Management"
    };
};

const DashboardLayout = () => {
    const location = useLocation();
    const pageMeta = getPageMeta(location.pathname);

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
