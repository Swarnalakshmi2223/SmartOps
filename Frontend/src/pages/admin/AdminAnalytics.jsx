import { useEffect, useState } from "react";
import {
    FiFileText,
    FiCheckCircle,
    FiUsers,
    FiTrendingUp
} from "react-icons/fi";

import api from "../../services/api";

import "./AdminAnalytics.css";

const AdminAnalytics = () => {

    const [dashboard, setDashboard] = useState(null);
    const [categories, setCategories] = useState([]);
    const [staffPerformance, setStaffPerformance] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError("");

            const [dashboardRes, categoryRes, staffRes] = await Promise.all([
                api.get("/analytics/dashboard"),
                api.get("/analytics/categories"),
                api.get("/analytics/staff-performance")
            ]);

            setDashboard(dashboardRes.data.analytics);
            setCategories(categoryRes.data.categories || []);
            setStaffPerformance(staffRes.data.staffPerformance || []);

        } catch (error) {
            console.error("Failed to fetch analytics:", error);
            setError(
                error.response?.data?.message ||
                "Failed to load analytics."
            );
        } finally {
            setLoading(false);
        }
    };

    const maxCategoryCount = categories.length > 0
        ? Math.max(...categories.map((c) => c.totalRequests))
        : 0;

    return (
        <div className="admin-analytics">

            <div className="admin-analytics-header">
                <h2>Analytics</h2>
                <p>Operational statistics and staff performance.</p>
            </div>

            {loading && (
                <div className="admin-analytics-message">Loading analytics...</div>
            )}

            {error && !loading && (
                <div className="admin-analytics-error">{error}</div>
            )}

            {!loading && !error && dashboard && (
                <>
                    <div className="admin-analytics-stats-grid">

                        <div className="admin-analytics-stat-card">
                            <div className="admin-analytics-stat-icon">
                                <FiFileText />
                            </div>
                            <div>
                                <span>Total requests</span>
                                <strong>{dashboard.requests.total}</strong>
                            </div>
                        </div>

                        <div className="admin-analytics-stat-card">
                            <div className="admin-analytics-stat-icon green">
                                <FiCheckCircle />
                            </div>
                            <div>
                                <span>Resolution rate</span>
                                <strong>{dashboard.resolutionRate}</strong>
                            </div>
                        </div>

                        <div className="admin-analytics-stat-card">
                            <div className="admin-analytics-stat-icon">
                                <FiUsers />
                            </div>
                            <div>
                                <span>Active users</span>
                                <strong>{dashboard.users.active}</strong>
                            </div>
                        </div>

                        <div className="admin-analytics-stat-card">
                            <div className="admin-analytics-stat-icon red">
                                <FiTrendingUp />
                            </div>
                            <div>
                                <span>High + Critical</span>
                                <strong>
                                    {dashboard.priority.high + dashboard.priority.critical}
                                </strong>
                            </div>
                        </div>

                    </div>

                    <div className="admin-analytics-section">
                        <h3>Requests by status</h3>
                        <div className="admin-analytics-bars">
                            {Object.entries(dashboard.requests)
                                .filter(([key]) => key !== "total")
                                .map(([key, value]) => (
                                    <div className="admin-analytics-bar-row" key={key}>
                                        <span className="admin-analytics-bar-label">
                                            {key}
                                        </span>
                                        <div className="admin-analytics-bar-track">
                                            <div
                                                className="admin-analytics-bar-fill"
                                                style={{
                                                    width: dashboard.requests.total > 0
                                                        ? `${(value / dashboard.requests.total) * 100}%`
                                                        : "0%"
                                                }}
                                            />
                                        </div>
                                        <span className="admin-analytics-bar-value">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="admin-analytics-section">
                        <h3>Requests by category</h3>

                        {categories.length === 0 ? (
                            <p className="admin-analytics-empty">No requests yet.</p>
                        ) : (
                            <div className="admin-analytics-bars">
                                {categories.map((category) => (
                                    <div
                                        className="admin-analytics-bar-row"
                                        key={category._id || "uncategorized"}
                                    >
                                        <span className="admin-analytics-bar-label">
                                            {category._id || "Uncategorized"}
                                        </span>
                                        <div className="admin-analytics-bar-track">
                                            <div
                                                className="admin-analytics-bar-fill purple"
                                                style={{
                                                    width: maxCategoryCount > 0
                                                        ? `${(category.totalRequests / maxCategoryCount) * 100}%`
                                                        : "0%"
                                                }}
                                            />
                                        </div>
                                        <span className="admin-analytics-bar-value">
                                            {category.totalRequests}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="admin-analytics-section">
                        <h3>Staff performance</h3>

                        {staffPerformance.length === 0 ? (
                            <p className="admin-analytics-empty">
                                No requests assigned to staff yet.
                            </p>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-analytics-table">
                                    <thead>
                                        <tr>
                                            <th>Staff</th>
                                            <th>Assigned</th>
                                            <th>Pending</th>
                                            <th>In Progress</th>
                                            <th>Resolved</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffPerformance.map((staff) => (
                                            <tr key={staff.staffId}>
                                                <td><strong>{staff.staffName}</strong></td>
                                                <td>{staff.totalAssigned}</td>
                                                <td>{staff.pending}</td>
                                                <td>{staff.inProgress}</td>
                                                <td>{staff.resolved}</td>
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

export default AdminAnalytics;