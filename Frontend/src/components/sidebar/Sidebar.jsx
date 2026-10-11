import { useState } from "react";
import BrandLogo from "./BrandLogo";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    FiActivity,
    FiBarChart2,
    FiBell,
    FiBriefcase,
    FiCheckSquare,
    FiChevronDown,
    FiFileText,
    FiGrid,
    FiLogOut,
    FiMessageSquare,
    FiSettings,
    FiTag,
    FiTrendingUp,
    FiUsers
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

import "./Sidebar.css";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [openGroups, setOpenGroups] = useState({ workspace: true });

    const getNavigationGroups = () => {
        const basePath = `/${user?.role}`;
        const workspace = [
            { label: "Dashboard", path: basePath, icon: <FiGrid /> },
            { label: user?.role === "user" ? "My Requests" : "Requests", path: `${basePath}/requests`, icon: <FiFileText /> }
        ];

        if (user?.role === "admin") {
            return [
                {
                    key: "workspace",
                    label: "Workspace",
                    items: [...workspace, { label: "Tasks", path: "/admin/tasks", icon: <FiCheckSquare /> }]
                },
                {
                    key: "management",
                    label: "Management",
                    items: [
                        { label: "Staff", path: "/admin/staff", icon: <FiUsers /> },
                        { label: "Users", path: "/admin/users", icon: <FiUsers /> },
                        { label: "Departments", path: "/admin/departments", icon: <FiBriefcase /> },
                        { label: "Categories", path: "/admin/categories", icon: <FiTag /> }
                    ]
                },
                {
                    key: "insights",
                    label: "Insights",
                    items: [
                        { label: "Reports", path: "/admin/reports", icon: <FiBarChart2 /> },
                        { label: "Analytics", path: "/admin/analytics", icon: <FiTrendingUp /> },
                        { label: "Feedback", path: "/admin/feedback", icon: <FiMessageSquare /> }
                    ]
                },
                {
                    key: "system",
                    label: "System",
                    items: [
                        { label: "Notifications", path: "/admin/notifications", icon: <FiBell /> },
                        { label: "Audit Logs", path: "/admin/audit-logs", icon: <FiActivity /> },
                        { label: "Settings", path: "/admin/settings", icon: <FiSettings /> }
                    ]
                }
            ];
        }

        return [
            {
                key: "workspace",
                label: "Workspace",
                items: [
                    ...workspace,
                    ...(user?.role === "staff" ? [{ label: "My Tasks", path: "/staff/tasks", icon: <FiCheckSquare /> }] : [])
                ]
            },
            {
                key: "system",
                label: "System",
                items: [
                    { label: "Notifications", path: `${basePath}/notifications`, icon: <FiBell /> },
                    { label: "Settings", path: `${basePath}/settings`, icon: <FiSettings /> }
                ]
            }
        ];
    };

    const navigationGroups = getNavigationGroups();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside className="sidebar">
          <div className="sidebar-brand">
              <BrandLogo />
          </div>

            <nav className="sidebar-navigation" aria-label="Primary navigation">
                {navigationGroups.map((group) => {
                    const isGroupActive = group.items.some((item) => (
                        location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                    ));
                    const isGroupOpen = Boolean(openGroups[group.key]) || isGroupActive;

                    return (
                        <section className="sidebar-group" key={group.key}>
                            <button
                                type="button"
                                className={`sidebar-group-toggle ${isGroupActive ? "active" : ""}`}
                                aria-label={`Toggle ${group.label} navigation`}
                                aria-expanded={isGroupOpen}
                                onClick={() => setOpenGroups((previous) => ({
                                    ...previous,
                                    [group.key]: !previous[group.key]
                                }))}
                            >
                                <span>{group.label}</span>
                                <FiChevronDown className={isGroupOpen ? "rotated" : ""} />
                            </button>

                            {isGroupOpen && (
                                <div className="sidebar-group-items">
                                    {group.items.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={item.path === `/${user?.role}`}
                                            title={item.label}
                                            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                                        >
                                            <span className="sidebar-link-icon">{item.icon}</span>
                                            <span className="sidebar-link-label">{item.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </section>
                    );
                })}
            </nav>

            <div className="sidebar-bottom">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                    <div className="sidebar-user-info">
                        <strong>{user?.name}</strong>
                        <span>{user?.role}</span>
                    </div>
                </div>

                <button type="button" className="sidebar-logout" onClick={handleLogout}>
                    <FiLogOut />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
