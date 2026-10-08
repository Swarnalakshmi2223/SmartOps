import { useEffect, useState } from "react";
import {
    FiFileText,
    FiClock,
    FiActivity,
    FiCheckCircle
} from "react-icons/fi";

import api from "../../services/api";
import useRealtimeRefresh from "../../hooks/useRealtimeRefresh";

import "./UserDashboard.css";

const UserDashboard = () => {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    useRealtimeRefresh(() => fetchRequests(), [
        "request.created",
        "request.assigned",
        "request.statusChanged",
        "request.started",
        "request.resolved",
        "request.closed"
    ]);

    const fetchRequests = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/requests/my");

            setRequests(response.data.requests || []);

        } catch (error) {

            console.error("Failed to fetch requests:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load your requests"
            );

        } finally {

            setLoading(false);

        }
    };

    const totalRequests = requests.length;

    const pendingRequests = requests.filter(
        (request) => request.status === "Pending"
    ).length;

    const inProgressRequests = requests.filter(
        (request) => request.status === "In Progress"
    ).length;

    const resolvedRequests = requests.filter(
        (request) => request.status === "Resolved"
    ).length;

    const getStatusClass = (status) => {

        switch (status) {

            case "Pending":
                return "status-pending";

            case "Assigned":
                return "status-assigned";

            case "In Progress":
                return "status-progress";

            case "Resolved":
                return "status-resolved";

            case "Closed":
                return "status-closed";

            default:
                return "";
        }
    };

    const getPriorityClass = (priority) => {

        switch (priority) {

            case "Low":
                return "priority-low";

            case "Medium":
                return "priority-medium";

            case "High":
                return "priority-high";

            case "Critical":
                return "priority-critical";

            default:
                return "";
        }
    };

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="user-dashboard">

            <div className="dashboard-welcome">

                <div>
                    <h2>Welcome back</h2>

                    <p>
                        Here's an overview of your service requests.
                    </p>
                </div>

            </div>

            {loading && (
                <div className="dashboard-message">
                    Loading your requests...
                </div>
            )}

            {error && !loading && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="stats-grid">

                        <div className="stat-card">

                            <div className="stat-icon">
                                <FiFileText />
                            </div>

                            <div className="stat-content">

                                <span>
                                    Total Requests
                                </span>

                                <strong>
                                    {totalRequests}
                                </strong>

                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-icon">
                                <FiClock />
                            </div>

                            <div className="stat-content">

                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {pendingRequests}
                                </strong>

                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-icon">
                                <FiActivity />
                            </div>

                            <div className="stat-content">

                                <span>
                                    In Progress
                                </span>

                                <strong>
                                    {inProgressRequests}
                                </strong>

                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-icon">
                                <FiCheckCircle />
                            </div>

                            <div className="stat-content">

                                <span>
                                    Resolved
                                </span>

                                <strong>
                                    {resolvedRequests}
                                </strong>

                            </div>

                        </div>

                    </div>

                    <div className="requests-section">

                        <div className="section-header">

                            <div>
                                <h3>
                                    Recent Requests
                                </h3>

                                <p>
                                    Your latest service requests
                                </p>
                            </div>

                        </div>

                        {requests.length === 0 ? (

                            <div className="empty-state">
                                <FiFileText />

                                <h4>
                                    No requests yet
                                </h4>

                                <p>
                                    You haven't created any service requests.
                                </p>
                            </div>

                        ) : (

                            <div className="requests-table-wrapper">

                                <table className="requests-table">

                                    <thead>
                                        <tr>

                                            <th>
                                                Request
                                            </th>

                                            <th>
                                                Category
                                            </th>

                                            <th>
                                                Priority
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Created
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {requests
                                            .slice(0, 5)
                                            .map((request) => (

                                                <tr key={request._id}>

                                                    <td>
                                                        <div className="request-title">

                                                            <strong>
                                                                {request.title}
                                                            </strong>

                                                            <span>
                                                                #{request._id.slice(-6)}
                                                            </span>

                                                        </div>
                                                    </td>

                                                    <td>
                                                        {request.category}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={`priority-badge ${getPriorityClass(
                                                                request.priority
                                                            )}`}
                                                        >
                                                            {request.priority}
                                                        </span>

                                                    </td>

                                                    <td>

                                                        <span
                                                            className={`status-badge ${getStatusClass(
                                                                request.status
                                                            )}`}
                                                        >
                                                            {request.status}
                                                        </span>

                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            request.createdAt
                                                        )}
                                                    </td>

                                                </tr>

                                            ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>
                </>
            )}

        </div>
    );
};

export default UserDashboard;
