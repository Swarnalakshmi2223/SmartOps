import { useEffect, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiClock } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

import "./RequestDetails.css";

const RequestDetails = () => {

    const navigate = useNavigate();

    const { id } = useParams();

    const [request, setRequest] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const fetchRequest = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await api.get(
                `/requests/${id}`
            );

            setRequest(response.data.request);

        } catch (error) {

            console.error(
                "Failed to fetch request:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load request."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        fetchRequest();

    }, [id]);

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

    const getTimelineState = (step) => {

        const statusOrder = [
            "Pending",
            "Assigned",
            "In Progress",
            "Resolved",
            "Closed"
        ];

        const currentIndex =
            statusOrder.indexOf(request?.status);

        const stepIndex =
            statusOrder.indexOf(step);

        if (stepIndex < currentIndex) {
            return "completed";
        }

        if (stepIndex === currentIndex) {
            return "current";
        }

        return "upcoming";
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
            <div className="request-details-message">
                Loading request...
            </div>
        );

    }

    if (error) {

        return (
            <div className="request-details-error">
                {error}
            </div>
        );

    }

    if (!request) {

        return (
            <div className="request-details-error">
                Request not found.
            </div>
        );

    }

    const timelineSteps = [
        "Pending",
        "Assigned",
        "In Progress",
        "Resolved",
        "Closed"
    ];

    return (
        <div className="request-details-page">

            <button
                type="button"
                className="request-back-button"
                onClick={() => navigate("/user/requests")}
            >
                <FiArrowLeft />

                Back to Requests
            </button>

            <div className="request-details-header">

                <div>

                    <div className="request-id">
                        Request #{request._id.slice(-6)}
                    </div>

                    <h2>
                        {request.title}
                    </h2>

                    <p>
                        Created on{" "}
                        {formatDate(request.createdAt)}
                    </p>

                </div>

                <div className="request-header-badges">

                    <span
                        className={`priority-badge ${getPriorityClass(
                            request.priority
                        )}`}
                    >
                        {request.priority}
                    </span>

                    <span
                        className={`status-badge ${getStatusClass(
                            request.status
                        )}`}
                    >
                        {request.status}
                    </span>

                </div>

            </div>

            <div className="request-details-grid">

                <div className="request-main-card">

                    <div className="details-card-header">

                        <h3>
                            Request Details
                        </h3>

                    </div>

                    <div className="details-card-body">

                        <div className="detail-item">

                            <label>
                                Description
                            </label>

                            <p className="request-description">
                                {request.description}
                            </p>

                        </div>

                        <div className="detail-row">

                            <div className="detail-item">

                                <label>
                                    Category
                                </label>

                                <span>
                                    {request.category}
                                </span>

                            </div>

                            <div className="detail-item">

                                <label>
                                    Priority
                                </label>

                                <span
                                    className={`priority-badge ${getPriorityClass(
                                        request.priority
                                    )}`}
                                >
                                    {request.priority}
                                </span>

                            </div>

                        </div>

                        <div className="detail-row">

                            <div className="detail-item">

                                <label>
                                    Created
                                </label>

                                <span>
                                    {formatDate(
                                        request.createdAt
                                    )}
                                </span>

                            </div>

                            <div className="detail-item">

                                <label>
                                    Assigned Staff
                                </label>

                                <span>
                                    {request.assignedTo?.name ||
                                        "Not assigned"}
                                </span>

                            </div>

                        </div>

                        {request.resolution && (

                            <div className="resolution-box">

                                <label>
                                    Resolution
                                </label>

                                <p>
                                    {request.resolution}
                                </p>

                            </div>

                        )}

                    </div>

                </div>

                <div className="request-timeline-card">

                    <div className="details-card-header">

                        <h3>
                            Request Timeline
                        </h3>

                    </div>

                    <div className="timeline">

                        {timelineSteps.map(
                            (step, index) => {

                                const state =
                                    getTimelineState(step);

                                return (
                                    <div
                                        className={`timeline-item ${state}`}
                                        key={step}
                                    >

                                        <div className="timeline-icon">

                                            {state === "completed" ? (
                                                <FiCheckCircle />
                                            ) : state === "current" ? (
                                                <FiClock />
                                            ) : (
                                                <span></span>
                                            )}

                                        </div>

                                        <div className="timeline-content">

                                            <strong>
                                                {step}
                                            </strong>

                                            {state === "current" && (
                                                <p>
                                                    Current status
                                                </p>
                                            )}

                                            {index <
                                                timelineSteps.length - 1 && (
                                                <div className="timeline-line"></div>
                                            )}

                                        </div>

                                    </div>
                                );

                            }
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default RequestDetails;