import { useEffect, useState } from "react";
import {
    FiFileText,
    FiPlay,
    FiCheckCircle,
    FiX
} from "react-icons/fi";

import api from "../../services/api";

import "./StaffRequests.css";

const StaffRequests = () => {

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [selectedRequest, setSelectedRequest] =
        useState(null);

    const [resolution, setResolution] =
        useState("");

    const [actionLoading, setActionLoading] =
        useState(false);

    const fetchRequests = async () => {

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
                "Failed to fetch staff requests:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load requests."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        fetchRequests();

    }, []);

    const startRequest = async (requestId) => {

        try {

            setActionLoading(true);

            await api.patch(
                `/requests/${requestId}/start`
            );

            await fetchRequests();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to start request."
            );

        } finally {

            setActionLoading(false);

        }
    };

    const resolveRequest = async () => {

        if (!resolution.trim()) {

            alert(
                "Please enter a resolution."
            );

            return;
        }

        try {

            setActionLoading(true);

            await api.patch(
                `/requests/${selectedRequest._id}/resolve`,
                {
                    resolution
                }
            );

            setSelectedRequest(null);

            setResolution("");

            await fetchRequests();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to resolve request."
            );

        } finally {

            setActionLoading(false);

        }
    };

    const getStatusClass = (status) => {

        switch (status) {

            case "Assigned":
                return "staff-request-status-assigned";

            case "In Progress":
                return "staff-request-status-progress";

            case "Resolved":
                return "staff-request-status-resolved";

            case "Closed":
                return "staff-request-status-closed";

            default:
                return "";
        }
    };

    const getPriorityClass = (priority) => {

        switch (priority) {

            case "Low":
                return "staff-request-priority-low";

            case "Medium":
                return "staff-request-priority-medium";

            case "High":
                return "staff-request-priority-high";

            case "Critical":
                return "staff-request-priority-critical";

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

    if (loading) {

        return (
            <div className="staff-requests-message">
                Loading requests...
            </div>
        );

    }

    return (
        <div className="staff-requests-page">

            <div className="staff-requests-header">

                <div>

                    <h2>
                        My Requests
                    </h2>

                    <p>
                        Manage service requests assigned to you.
                    </p>

                </div>

                <div className="staff-request-count">

                    {requests.length} requests

                </div>

            </div>

            {error && (
                <div className="staff-requests-error">
                    {error}
                </div>
            )}

            {!error && requests.length === 0 && (

                <div className="staff-no-requests">

                    <FiFileText />

                    <h3>
                        No requests assigned
                    </h3>

                    <p>
                        You currently have no service requests
                        assigned to you.
                    </p>

                </div>

            )}

            {!error && requests.length > 0 && (

                <div className="staff-request-list">

                    {requests.map((request) => (

                        <div
                            className="staff-request-card"
                            key={request._id}
                        >

                            <div className="staff-request-card-main">

                                <div className="staff-request-card-title">

                                    <span className="staff-request-id">
                                        #{request._id.slice(-6)}
                                    </span>

                                    <h3>
                                        {request.title}
                                    </h3>

                                </div>

                                <p className="staff-request-description">
                                    {request.description}
                                </p>

                                <div className="staff-request-meta">

                                    <span>
                                        Category:
                                        <strong>
                                            {request.category}
                                        </strong>
                                    </span>

                                    <span>
                                        Created:
                                        <strong>
                                            {formatDate(
                                                request.createdAt
                                            )}
                                        </strong>
                                    </span>

                                </div>

                            </div>

                            <div className="staff-request-card-side">

                                <div className="staff-request-badges">

                                    <span
                                        className={`staff-request-priority ${getPriorityClass(
                                            request.priority
                                        )}`}
                                    >
                                        {request.priority}
                                    </span>

                                    <span
                                        className={`staff-request-status ${getStatusClass(
                                            request.status
                                        )}`}
                                    >
                                        {request.status}
                                    </span>

                                </div>

                                <div className="staff-request-actions">

                                    {request.status ===
                                        "Assigned" && (

                                        <button
                                            type="button"
                                            className="staff-start-button"
                                            disabled={
                                                actionLoading
                                            }
                                            onClick={() =>
                                                startRequest(
                                                    request._id
                                                )
                                            }
                                        >
                                            <FiPlay />

                                            Start Request
                                        </button>

                                    )}

                                    {request.status ===
                                        "In Progress" && (

                                        <button
                                            type="button"
                                            className="staff-resolve-button"
                                            onClick={() => {
                                                setSelectedRequest(
                                                    request
                                                );

                                                setResolution("");
                                            }}
                                        >
                                            <FiCheckCircle />

                                            Resolve
                                        </button>

                                    )}

                                    {(request.status ===
                                        "Resolved" ||
                                        request.status ===
                                            "Closed") && (

                                        <span className="staff-completed-label">

                                            <FiCheckCircle />

                                            Completed

                                        </span>

                                    )}

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

            {selectedRequest && (

                <div className="staff-modal-overlay">

                    <div className="staff-resolution-modal">

                        <div className="staff-modal-header">

                            <div>

                                <span>
                                    Resolve Request
                                </span>

                                <h3>
                                    {selectedRequest.title}
                                </h3>

                            </div>

                            <button
                                type="button"
                                className="staff-modal-close"
                                onClick={() => {
                                    setSelectedRequest(
                                        null
                                    );

                                    setResolution("");
                                }}
                            >
                                <FiX />
                            </button>

                        </div>

                        <div className="staff-modal-body">

                            <label>
                                Resolution
                            </label>

                            <textarea
                                value={resolution}
                                onChange={(event) =>
                                    setResolution(
                                        event.target.value
                                    )
                                }
                                placeholder="Describe how the issue was resolved..."
                                rows="6"
                            />

                            <p>
                                Enter a clear explanation of
                                the solution provided.
                            </p>

                        </div>

                        <div className="staff-modal-footer">

                            <button
                                type="button"
                                className="staff-cancel-button"
                                onClick={() => {
                                    setSelectedRequest(
                                        null
                                    );

                                    setResolution("");
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="staff-confirm-button"
                                disabled={actionLoading}
                                onClick={resolveRequest}
                            >
                                <FiCheckCircle />

                                {actionLoading
                                    ? "Resolving..."
                                    : "Resolve Request"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default StaffRequests;