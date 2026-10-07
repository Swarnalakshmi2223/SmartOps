import { NavLink, useNavigate } from "react-router-dom";
import {
    FiGrid,
    FiFileText,
    FiCheckSquare,
    FiBell,
    FiUsers,
    FiBarChart2,
    FiSettings,
    FiLogOut,
    FiBriefcase,
    FiTag,
    FiTrendingUp
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

import "./Sidebar.css";

const Sidebar = () => {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getNavigationItems = () => {

        if (user?.role === "admin") {
            return [
                {
                    label: "Dashboard",
                    path: "/admin",
                    icon: <FiGrid />
                },
                {
                    label: "Requests",
                    path: "/admin/requests",
                    icon: <FiFileText />
                },
                {
                    label: "Tasks",
                    path: "/admin/tasks",
                    icon: <FiCheckSquare />
                },
                {
                    label: "Staff",
                    path: "/admin/staff",
                    icon: <FiUsers />
                },
                {
                    label: "Reports",
                    path: "/admin/reports",
                    icon: <FiBarChart2 />
                },
                {
                    label: "Notifications",
                    path: "/admin/notifications",
                    icon: <FiBell />
                },
                {
                    label: "Departments",
                    path: "/admin/departments",
                    icon: <FiBriefcase />
                },
                {
                    label: "Categories",
                    path: "/admin/categories",
                    icon: <FiTag />
                },
                {
                    label: "Analytics",
                    path: "/admin/analytics",
                    icon: <FiTrendingUp />
                },
            ];
        }

        if (user?.role === "staff") {
            return [
                {
                    label: "Dashboard",
                    path: "/staff",
                    icon: <FiGrid />
                },
                {
                    label: "My Requests",
                    path: "/staff/requests",
                    icon: <FiFileText />
                },
                {
                    label: "My Tasks",
                    path: "/staff/tasks",
                    icon: <FiCheckSquare />
                },
                {
                    label: "Notifications",
                    path: "/staff/notifications",
                    icon: <FiBell />
                }
            ];
        }

        return [
            {
                label: "Dashboard",
                path: "/user",
                icon: <FiGrid />
            },
            {
                label: "My Requests",
                path: "/user/requests",
                icon: <FiFileText />
            },
            {
                label: "Notifications",
                path: "/user/notifications",
                icon: <FiBell />
            }
        ];
    };

    const navigationItems = getNavigationItems();

    return (
        <aside className="sidebar">

            <div className="sidebar-brand">

                <div className="sidebar-logo">
                    S
                </div>

                <div className="sidebar-brand-text">
                    <h2>SmartOps</h2>
                    <span>Operations Platform</span>
                </div>

            </div>

            <nav className="sidebar-navigation">

                <p className="sidebar-section-title">
                    WORKSPACE
                </p>

                {navigationItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === `/${user?.role}`}
                        className={({ isActive }) =>
                            `sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span className="sidebar-link-icon">
                            {item.icon}
                        </span>

                        <span className="sidebar-link-label">
                            {item.label}
                        </span>
                    </NavLink>
                ))}

                <p className="sidebar-section-title sidebar-settings-title">
                    SYSTEM
                </p>

                <NavLink
                    to={`/${user?.role}/settings`}
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-link-icon">
                        <FiSettings />
                    </span>

                    <span className="sidebar-link-label">
                        Settings
                    </span>
                </NavLink>

            </nav>

            <div className="sidebar-bottom">

                <div className="sidebar-user">

                    <div className="sidebar-user-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="sidebar-user-info">

                        <strong>
                            {user?.name}
                        </strong>

                        <span>
                            {user?.role}
                        </span>

                    </div>

                </div>

                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    <FiLogOut />

                    <span>
                        Logout
                    </span>
                </button>

            </div>

        </aside>
    );
};

export default Sidebar;