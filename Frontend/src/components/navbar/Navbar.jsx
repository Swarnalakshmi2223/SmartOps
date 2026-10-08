import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import socketService from "../../services/socket";

import "./Navbar.css";

const Navbar = ({ title, subtitle }) => {

    const { user } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        try {
            const response = await api.get("/notifications/unread");
            setUnreadCount(
                response.data.count ??
                response.data.notifications?.length ??
                0
            );
        } catch (error) {
            console.error("Failed to load unread notifications:", error);
        }
    }, [user]);

    useEffect(() => {
        fetchUnreadCount();

        const refreshNotifications = () => fetchUnreadCount();
        const handleWindowFocus = () => fetchUnreadCount();
        const unsubscribeSocket = socketService.on(
            "notification.created",
            fetchUnreadCount
        );

        window.addEventListener(
            "smartops:notifications-updated",
            refreshNotifications
        );
        window.addEventListener("focus", handleWindowFocus);

        const intervalId = window.setInterval(fetchUnreadCount, 30000);

        return () => {
            window.removeEventListener(
                "smartops:notifications-updated",
                refreshNotifications
            );
            window.removeEventListener("focus", handleWindowFocus);
            window.clearInterval(intervalId);
            unsubscribeSocket();
        };
    }, [fetchUnreadCount]);

    const openNotifications = () => {
        navigate(`/${user?.role || "user"}/notifications`);
    };

    return (
        <header className="navbar">

            <div className="navbar-page-info">

                <h1>
                    {title}
                </h1>

                {subtitle && (
                    <p>
                        {subtitle}
                    </p>
                )}

            </div>

            <div className="navbar-actions">

                <button
                    type="button"
                    className="navbar-notification"
                    aria-label="Notifications"
                    onClick={openNotifications}
                >
                    <FiBell />

                    {unreadCount > 0 && (
                        <span className="notification-count">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>

                <div className="navbar-divider"></div>

                <div className="navbar-user">

                    <div className="navbar-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="navbar-user-info">

                        <strong>
                            {user?.name}
                        </strong>

                        <span>
                            {user?.role}
                        </span>

                    </div>

                    <FiChevronDown className="navbar-chevron" />

                </div>

            </div>

        </header>
    );
};

export default Navbar;
