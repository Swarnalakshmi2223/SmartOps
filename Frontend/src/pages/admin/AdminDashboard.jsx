import { useEffect, useState } from "react";
import {
    FiFileText,
    FiClock,
    FiUserCheck,
    FiActivity,
    FiCheckCircle
} from "react-icons/fi";

import api from "../../services/api";
import useRealtimeRefresh from "../../hooks/useRealtimeRefresh";

import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get("/requests");
            setRequests(response.data.requests || []);
        } catch (requestError) {
            console.error("Failed to fetch requests:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Failed to load requests."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    useRealtimeRefresh(() => {
        fetchRequests();
    }, [
        "request.created",
        "request.assigned",
        "request.statusChanged",
        "request.started",
        "request.resolved",
        "request.closed"
    ]);

    const pendingRequests = requests.filter((request) => request.status === "Pending").length;
    const assignedRequests = requests.filter((request) => request.status === "Assigned").length;
    const inProgressRequests = requests.filter((request) => request.status === "In Progress").length;
    const resolvedRequests = requests.filter((request) => request.status === "Resolved").length;
    const closedRequests = requests.filter((request) => request.status === "Closed").length;

    const getStatusClass = (status) => {
        switch (status) {
            case "Pending": return "admin-status-pending";
            case "Assigned": return "admin-status-assigned";
            case "In Progress": return "admin-status-progress";
            case "Resolved": return "admin-status-resolved";
            case "Closed": return "admin-status-closed";
            default: return "";
        }
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case "Low": return "admin-priority-low";
            case "Medium": return "admin-priority-medium";
            case "High": return "admin-priority-high";
            case "Critical": return "admin-priority-critical";
            default: return "";
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard-welcome">
                <div>
                    <h2>Welcome back</h2>
                    <p>Here&apos;s an overview of your SmartOps operations.</p>
                </div>
            </div>

            {loading && <div className="admin-dashboard-message">Loading dashboard...</div>}
            {error && !loading && <div className="admin-dashboard-error">{error}</div>}

            {!loading && !error && (
                <>
                    <div className="admin-stats-grid">
                        <div className="admin-stat-card"><div className="admin-stat-icon"><FiFileText /></div><div className="admin-stat-content"><span>Total Requests</span><strong>{requests.length}</strong></div></div>
                        <div className="admin-stat-card"><div className="admin-stat-icon"><FiClock /></div><div className="admin-stat-content"><span>Pending</span><strong>{pendingRequests}</strong></div></div>
                        <div className="admin-stat-card"><div className="admin-stat-icon"><FiUserCheck /></div><div className="admin-stat-content"><span>Assigned</span><strong>{assignedRequests}</strong></div></div>
                        <div className="admin-stat-card"><div className="admin-stat-icon"><FiActivity /></div><div className="admin-stat-content"><span>In Progress</span><strong>{inProgressRequests}</strong></div></div>
                        <div className="admin-stat-card"><div className="admin-stat-icon"><FiCheckCircle /></div><div className="admin-stat-content"><span>Resolved</span><strong>{resolvedRequests}</strong></div></div>
                        <div className="admin-stat-card"><div className="admin-stat-icon"><FiCheckCircle /></div><div className="admin-stat-content"><span>Closed</span><strong>{closedRequests}</strong></div></div>
                    </div>

                    <div className="admin-requests-section">
                        <div className="admin-section-header">
                            <div>
                                <h3>Recent Requests</h3>
                                <p>Latest service requests across the system</p>
                            </div>
                        </div>

                        {requests.length === 0 ? (
                            <div className="admin-empty-state">
                                <FiFileText />
                                <h4>No requests yet</h4>
                                <p>No service requests have been created.</p>
                            </div>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-requests-table">
                                    <thead>
                                        <tr><th>Request</th><th>Created By</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th></tr>
                                    </thead>
                                    <tbody>
                                        {requests.slice(0, 8).map((request) => (
                                            <tr key={request._id}>
                                                <td><div className="admin-request-info"><strong>{request.title}</strong><span>#{request._id.slice(-6)}</span></div></td>
                                                <td>{request.createdBy?.name || "-"}</td>
                                                <td>{request.category}</td>
                                                <td><span className={`admin-priority-badge ${getPriorityClass(request.priority)}`}>{request.priority}</span></td>
                                                <td><span className={`admin-status-badge ${getStatusClass(request.status)}`}>{request.status}</span></td>
                                                <td>{formatDate(request.createdAt)}</td>
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

export default AdminDashboard;
