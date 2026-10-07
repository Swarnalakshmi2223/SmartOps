import { useEffect, useState } from "react";
import {
    FiFileText,
    FiClock,
    FiActivity,
    FiCheckCircle
} from "react-icons/fi";

import api from "../../services/api";

import "./StaffDashboard.css";

const StaffDashboard = () => {

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {

        fetchAssignedRequests();

    }, []);

    const fetchAssignedRequests = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await api.get(
                "/requests/assigned"
            );

            setRequests(
                response.data.requests || []
            );

        } catch (error) {

            console.error(
                "Failed to fetch assigned requests:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load assigned requests."
            );

        } finally {

            setLoading(false);

        }
    };

    const pendingRequests = requests.filter(
        (request) =>
            request.status === "Assigned"
    ).length;

    const inProgressRequests = requests.filter(
        (request) =>
            request.status === "In Progress"
    ).length;

    const resolvedRequests = requests.filter(
        (request) =>
            request.status === "Resolved"
    ).length;

    const totalRequests = requests.length;

    const getStatusClass = (status) => {

        switch (status) {

            case "Assigned":
                return "staff-status-assigned";

            case "In Progress":
                return "staff-status-progress";

            case "Resolved":
                return "staff-status-resolved";

            case "Closed":
                return "staff-status-closed";

            default:
                return "";
        }
    };

    const getPriorityClass = (priority) => {

        switch (priority) {

            case "Low":
                return "staff-priority-low";

            case "Medium":
                return "staff-priority-medium";

            case "High":
                return "staff-priority-high";

            case "Critical":
                return "staff-priority-critical";

            default:
                return "";
        }
    };

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    return (
        <div className="staff-dashboard">

            <div className="staff-dashboard-welcome">

                <div>

                    <h2>
                        Welcome back
                    </h2>

                    <p>
                        Here's an overview of your assigned
                        service requests.
                    </p>

                </div>

            </div>

            {loading && (
                <div className="staff-dashboard-message">
                    Loading assigned requests...
                </div>
            )}

            {error && !loading && (
                <div className="staff-dashboard-error">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>

                    <div className="staff-stats-grid">

                        <div className="staff-stat-card">

                            <div className="staff-stat-icon">
                                <FiFileText />
                            </div>

                            <div className="staff-stat-content">

                                <span>
                                    Total Assigned
                                </span>

                                <strong>
                                    {totalRequests}
                                </strong>

                            </div>

                        </div>

                        <div className="staff-stat-card">

                            <div className="staff-stat-icon">
                                <FiClock />
                            </div>

                            <div className="staff-stat-content">

                                <span>
                                    Assigned
                                </span>

                                <strong>
                                    {pendingRequests}
                                </strong>

                            </div>

                        </div>

                        <div className="staff-stat-card">

                            <div className="staff-stat-icon">
                                <FiActivity />
                            </div>

                            <div className="staff-stat-content">

                                <span>
                                    In Progress
                                </span>

                                <strong>
                                    {inProgressRequests}
                                </strong>

                            </div>

                        </div>

                        <div className="staff-stat-card">

                            <div className="staff-stat-icon">
                                <FiCheckCircle />
                            </div>

                            <div className="staff-stat-content">

                                <span>
                                    Resolved
                                </span>

                                <strong>
                                    {resolvedRequests}
                                </strong>

                            </div>

                        </div>

                    </div>

                    <div className="staff-requests-section">

                        <div className="staff-section-header">

                            <div>

                                <h3>
                                    Assigned Requests
                                </h3>

                                <p>
                                    Requests currently assigned to you
                                </p>

                            </div>

                        </div>

                        {requests.length === 0 ? (

                            <div className="staff-empty-state">

                                <FiFileText />

                                <h4>
                                    No assigned requests
                                </h4>

                                <p>
                                    You currently have no requests
                                    assigned to you.
                                </p>

                            </div>

                        ) : (

                            <div className="staff-table-wrapper">

                                <table className="staff-requests-table">

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

                                                <tr
                                                    key={request._id}
                                                >

                                                    <td>

                                                        <div className="staff-request-info">

                                                            <strong>
                                                                {request.title}
                                                            </strong>

                                                            <span>
                                                                #
                                                                {request._id.slice(
                                                                    -6
                                                                )}
                                                            </span>

                                                        </div>

                                                    </td>

                                                    <td>
                                                        {request.category}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={`staff-priority-badge ${getPriorityClass(
                                                                request.priority
                                                            )}`}
                                                        >
                                                            {
                                                                request.priority
                                                            }
                                                        </span>

                                                    </td>

                                                    <td>

                                                        <span
                                                            className={`staff-status-badge ${getStatusClass(
                                                                request.status
                                                            )}`}
                                                        >
                                                            {
                                                                request.status
                                                            }
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

export default StaffDashboard;