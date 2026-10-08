import { useEffect, useState } from "react";
import {
    FiBell,
    FiCheck,
    FiCheckCircle,
    FiRefreshCw,
    FiTrash2
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import useRealtimeRefresh from "../hooks/useRealtimeRefresh";
import "./Notifications.css";

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [filter, setFilter] = useState("all");
    const [error, setError] = useState("");

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/notifications");

            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error("Failed to load notifications:", error);
            setError(
                error.response?.data?.message ||
                "Failed to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useRealtimeRefresh(() => fetchNotifications(), ["notification.created"]);

    const markAsRead = async (notificationId) => {
        try {
            setActionLoading(notificationId);

            await api.patch(
                `/notifications/${notificationId}/read`
            );

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification._id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
            window.dispatchEvent(new Event("smartops:notifications-updated"));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);

            setError(
                error.response?.data?.message ||
                "Failed to mark notification as read."
            );
        } finally {
            setActionLoading("");
        }
    };

    const markAllAsRead = async () => {
        try {
            setActionLoading("all");

            await api.patch("/notifications/read-all");

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) => ({
                    ...notification,
                    isRead: true
                }))
            );
            window.dispatchEvent(new Event("smartops:notifications-updated"));
        } catch (error) {
            console.error(
                "Failed to mark all notifications as read:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to mark all notifications as read."
            );
        } finally {
            setActionLoading("");
        }
    };

    const deleteNotification = async (notificationId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this notification?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(notificationId);

            await api.delete(
                `/notifications/${notificationId}`
            );

            setNotifications((currentNotifications) =>
                currentNotifications.filter(
                    (notification) =>
                        notification._id !== notificationId
                )
            );
            window.dispatchEvent(new Event("smartops:notifications-updated"));
        } catch (error) {
            console.error(
                "Failed to delete notification:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete notification."
            );
        } finally {
            setActionLoading("");
        }
    };

    const openNotification = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }

        if (notification.relatedRequest?._id) {
            navigate(
                `/${user?.role || "user"}/requests/${notification.relatedRequest._id}`
            );
            return;
        }

        if (notification.relatedTask?._id && user?.role !== "user") {
            navigate(`/${user.role}/tasks`);
        }
    };

    const filteredNotifications =
        filter === "unread"
            ? notifications.filter(
                (notification) => !notification.isRead
            )
            : notifications;

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    const formatDateTime = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getTypeClass = (type) => {
        switch (type) {
            case "assignment":
                return "notification-type-assignment";

            case "status":
                return "notification-type-status";

            case "task":
                return "notification-type-task";

            case "request":
                return "notification-type-request";

            default:
                return "notification-type-system";
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case "assignment":
                return "Assignment";

            case "status":
                return "Status";

            case "task":
                return "Task";

            case "request":
                return "Request";

            default:
                return "System";
        }
    };

    if (loading) {
        return (
            <div className="notifications-page">
                <div className="notifications-message">
                    Loading notifications...
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-page">

            <div className="notifications-header">

                <div>
                    <h1>Notifications</h1>

                    <p>
                        Stay updated with your SmartOps activities.
                    </p>
                </div>

                <div className="notifications-header-actions">

                    <div className="notification-summary">
                        <FiBell />
                        <span>
                            {unreadCount} unread
                        </span>
                    </div>

                    <button
                        className="mark-all-button"
                        onClick={markAllAsRead}
                        disabled={
                            actionLoading === "all" ||
                            unreadCount === 0
                        }
                    >
                        <FiCheckCircle />

                        {actionLoading === "all"
                            ? "Marking..."
                            : "Mark all as read"}
                    </button>

                    <button
                        type="button"
                        className="notification-refresh-button"
                        onClick={fetchNotifications}
                        disabled={actionLoading !== ""}
                        title="Refresh notifications"
                    >
                        <FiRefreshCw />
                        Refresh
                    </button>

                </div>
            </div>

            {error && (
                <div className="notifications-error" role="alert">
                    <span>{error}</span>
                    <button type="button" onClick={fetchNotifications}>
                        Try again
                    </button>
                </div>
            )}

            <div className="notification-filters">

                <button
                    className={
                        filter === "all"
                            ? "notification-filter active"
                            : "notification-filter"
                    }
                    onClick={() => setFilter("all")}
                >
                    All
                </button>

                <button
                    className={
                        filter === "unread"
                            ? "notification-filter active"
                            : "notification-filter"
                    }
                    onClick={() => setFilter("unread")}
                >
                    Unread
                </button>

            </div>

            {filteredNotifications.length === 0 ? (

                <div className="notifications-empty">

                    <FiBell />

                    <h3>
                        {filter === "unread"
                            ? "No unread notifications"
                            : "No notifications"}
                    </h3>

                    <p>
                        You're all caught up.
                    </p>

                </div>

            ) : (

                <div className="notifications-list">

                    {filteredNotifications.map((notification) => (

                        <div
                            key={notification._id}
                            className={
                                notification.isRead
                                    ? "notification-card read"
                                    : "notification-card unread"
                            }
                            onClick={() => openNotification(notification)}
                            onKeyDown={(event) => {
                                if (
                                    (event.key === "Enter" || event.key === " ") &&
                                    (notification.relatedRequest || notification.relatedTask)
                                ) {
                                    event.preventDefault();
                                    openNotification(notification);
                                }
                            }}
                            role={
                                notification.relatedRequest || notification.relatedTask
                                    ? "button"
                                    : undefined
                            }
                            tabIndex={
                                notification.relatedRequest || notification.relatedTask
                                    ? 0
                                    : undefined
                            }
                        >

                            <div className="notification-icon">
                                <FiBell />
                            </div>

                            <div className="notification-content">

                                <div className="notification-top">

                                    <div className="notification-title-group">

                                        <h3>
                                            {notification.title}
                                        </h3>

                                        <span
                                            className={`notification-type ${getTypeClass(
                                                notification.type
                                            )}`}
                                        >
                                            {getTypeLabel(
                                                notification.type
                                            )}
                                        </span>

                                    </div>

                                    {!notification.isRead && (
                                        <span className="unread-dot"></span>
                                    )}

                                </div>

                                <p className="notification-message">
                                    {notification.message}
                                </p>

                                <div className="notification-meta">

                                    <span>
                                        {formatDateTime(
                                            notification.createdAt
                                        )}
                                    </span>

                                    {notification.relatedTask && (
                                        <span>
                                            Task:{" "}
                                            {notification.relatedTask.title}
                                        </span>
                                    )}

                                    {notification.relatedRequest && (
                                        <span>
                                            Request:{" "}
                                            {notification.relatedRequest.title}
                                        </span>
                                    )}

                                </div>

                            </div>

                            <div className="notification-actions">

                                {!notification.isRead && (
                                    <button
                                        className="notification-action read-action"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            markAsRead(notification._id);
                                        }}
                                        disabled={
                                            actionLoading ===
                                            notification._id
                                        }
                                        title="Mark as read"
                                    >
                                        <FiCheck />
                                    </button>
                                )}

                                <button
                                    className="notification-action delete-action"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        deleteNotification(notification._id);
                                    }}
                                    disabled={
                                        actionLoading ===
                                        notification._id
                                    }
                                    title="Delete notification"
                                >
                                    <FiTrash2 />
                                </button>

                            </div>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
};

export default Notifications;
