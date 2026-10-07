import { Outlet } from "react-router-dom";

import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";

import "./DashboardLayout.css";

const DashboardLayout = () => {

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Navbar
                    title="Dashboard"
                    subtitle="Smart Operations & Service Management"
                />

                <main className="dashboard-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
};

export default DashboardLayout;