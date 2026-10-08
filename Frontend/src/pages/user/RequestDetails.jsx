import { useEffect, useMemo, useState } from "react";
import {
    FiArrowLeft,
    FiCheckCircle,
    FiClock,
    FiDownload,
    FiMessageSquare,
    FiPaperclip
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import useRealtimeRefresh from "../../hooks/useRealtimeRefresh";

import "./RequestDetails.css";

const statusOrder = [
    "Pending",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed"
];

const RequestDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const role = user?.role;

    const [request, setRequest] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [comment, setComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState("");

    const isUser = role === "user";
    const canComment =
        role === "user" || role === "staff" || role === "admin";
    const canClose = isUser && request?.status === "Resolved";

    const fetchComments = async () => {
        try {
            setCommentsLoading(true);
            setCommentsError("");

            const response = await api.get(
                `/requests/${id}/comments`
            );

            setComments(response.data.comments || []);
        } catch (commentsFetchError) {
            console.error(
                "Failed to fetch comments:",
                commentsFetchError
            );

            setCommentsError(
                commentsFetchError.response?.data?.message ||
                    "Failed to load comments."
            );
        } finally {
            setCommentsLoading(false);
        }
    };

    const fetchRequest = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/requests/${id}`);

            setRequest(response.data.request);

            await fetchComments();

            if (isUser) {
                try {
                    const feedbackResponse = await api.get(
                        "/feedback/my"
                    );

                    const ownFeedback = (
                        feedbackResponse.data.feedback || []
                    ).find(
                        (item) =>
                            item.requestId?._id === id ||
                            item.requestId === id
                    );

                    setFeedback(ownFeedback || null);
                } catch {
                    setFeedback(null);
                }
            }
        } catch (requestError) {
            console.error(
                "Failed to fetch request:",
                requestError
            );

            setError(
                requestError.response?.data?.message ||
                    "Failed to load request."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequest();
    }, [id, role]);

    useRealtimeRefresh(() => fetchRequest(), [
        "request.assigned",
        "request.statusChanged",
        "request.started",
        "request.resolved",
        "request.closed",
        "request.commentAdded"
    ]);

    const formatDate = (date, includeTime = false) => {
        if (!date) {
            return "-";
        }

        const dateOptions = includeTime
            ? {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
              }
            : {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
              };

        return new Date(date).toLocaleString(
            "en-IN",
            dateOptions
        );
    };

    const getPriorityClass = (priority) => {
        return `priority-${(priority || "").toLowerCase()}`;
    };

    const getStatusClass = (status) => {
        const statusClasses = {
            Pending: "status-pending",
            Assigned: "status-assigned",
            "In Progress": "status-progress",
            Resolved: "status-resolved",
            Closed: "status-closed"
        };

        return statusClasses[status] || "";
    };

    const attachmentUrl = useMemo(() => {
        if (!request?.attachment) {
            return "";
        }

        return `${api.defaults.baseURL}/requests/${request._id}/attachment`;
    }, [request?.attachment, request?._id]);

    const evidenceUrl = useMemo(() => {
        if (!request?.resolutionEvidence) {
            return "";
        }

        return `${api.defaults.baseURL}/requests/${request._id}/evidence`;
    }, [request?.resolutionEvidence, request?._id]);

    const hasEvidenceFile =
        typeof request?.resolutionEvidence === "string" &&
        /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|pdf|doc|docx)$/i.test(
            request.resolutionEvidence
        );

    const addComment = async (event) => {
        event.preventDefault();

        if (!comment.trim()) {
            return;
        }

        try {
            setCommentLoading(true);
            setError("");

            await api.post(`/requests/${id}/comments`, {
                text: comment.trim()
            });

            setComment("");

            await fetchComments();
        } catch (commentError) {
            setError(
                commentError.response?.data?.message ||
                    "Failed to add comment."
            );
        } finally {
            setCommentLoading(false);
        }
    };

    const closeRequest = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to close this resolved request?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setSuccessMessage("");

            const response = await api.patch(
                `/requests/${id}/close`
            );

            await fetchRequest();
            setSuccessMessage(
                response.data.message ||
                    "Request closed successfully."
            );
        } catch (closeError) {
            setError(
                closeError.response?.data?.message ||
                    "Failed to close request."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const submitFeedback = async (event) => {
        event.preventDefault();

        const rating = Number(feedbackRating);

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            setError("Rating must be between 1 and 5.");
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setSuccessMessage("");

            const response = await api.post("/feedback", {
                requestId: id,
                rating,
                comment: feedbackComment.trim() || undefined
            });

            setFeedback(response.data.feedback);
            setFeedbackComment("");
            setSuccessMessage(
                response.data.message ||
                    "Feedback submitted successfully."
            );
        } catch (feedbackError) {
            setError(
                feedbackError.response?.data?.message ||
                    "Failed to submit feedback."
            );
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="request-details-message">
                Loading request...
            </div>
        );
    }

    if (error && !request) {
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

    const currentIndex = statusOrder.indexOf(request.status);

    return (
        <div className="request-details-page">
            <button
                type="button"
                className="request-back-button"
                onClick={() => navigate(-1)}
            >
                <FiArrowLeft />
                Back to Requests
            </button>

            {error && (
                <div className="request-details-error request-details-inline-error">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="request-details-success">
                    {successMessage}
                </div>
            )}

            <div className="request-details-header">
                <div>
                    <div className="request-id">
                        {request.requestNumber ||
                            `Request #${request._id.slice(-6)}`}
                    </div>

                    <h2>{request.title}</h2>

                    <p>
                        Created on {formatDate(request.createdAt, true)}
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
                        <h3>Request Details</h3>
                    </div>

                    <div className="details-card-body">
                        <div className="detail-item">
                            <label>Description</label>
                            <p className="request-description">
                                {request.description}
                            </p>
                        </div>

                        <div className="detail-row">
                            <div className="detail-item">
                                <label>Category</label>
                                <span>{request.category || "-"}</span>
                            </div>

                            <div className="detail-item">
                                <label>Department</label>
                                <span>
                                    {request.department ||
                                        request.aiDepartment ||
                                        "-"}
                                </span>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-item">
                                <label>Location</label>
                                <span>{request.location || "-"}</span>
                            </div>

                            <div className="detail-item">
                                <label>Assigned Staff</label>
                                <span>
                                    {request.assignedTo?.name ||
                                        "Not assigned"}
                                </span>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-item">
                                <label>Created</label>
                                <span>
                                    {formatDate(request.createdAt, true)}
                                </span>
                            </div>

                            <div className="detail-item">
                                <label>Request Number</label>
                                <span>
                                    {request.requestNumber || request._id}
                                </span>
                            </div>
                        </div>

                        {request.attachment && (
                            <div className="attachment-box">
                                <label>
                                    <FiPaperclip />
                                    Attachment
                                </label>

                                <a
                                    href={attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                >
                                    <FiDownload />
                                    {request.attachment}
                                </a>
                            </div>
                        )}

                        {request.resolution && (
                            <div className="resolution-box">
                                <label>Resolution</label>
                                <p>{request.resolution}</p>
                            </div>
                        )}

                        {request.resolutionEvidence && (
                            <div className="resolution-box">
                                <label>Resolution Evidence</label>
                                {hasEvidenceFile ? (
                                    <a
                                        href={evidenceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        download
                                    >
                                        <FiDownload />
                                        View resolution evidence
                                    </a>
                                ) : (
                                    <p>{request.resolutionEvidence}</p>
                                )}
                            </div>
                        )}

                        {canClose && (
                            <button
                                type="button"
                                className="request-action-button"
                                disabled={actionLoading}
                                onClick={closeRequest}
                            >
                                {actionLoading
                                    ? "Closing..."
                                    : "Close Request"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="request-timeline-card">
                    <div className="details-card-header">
                        <h3>Status History</h3>
                    </div>

                    <div className="timeline">
                        {statusOrder.map((step, index) => {
                            const state =
                                index < currentIndex
                                    ? "completed"
                                    : index === currentIndex
                                      ? "current"
                                      : "upcoming";

                            const historyItem = (
                                request.statusHistory || []
                            ).find((item) => item.status === step);

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
                                            <span />
                                        )}
                                    </div>

                                    <div className="timeline-content">
                                        <strong>{step}</strong>

                                        {historyItem && (
                                            <p>
                                                {formatDate(
                                                    historyItem.changedAt,
                                                    true
                                                )}
                                                {historyItem.changedBy
                                                    ?.name &&
                                                    ` · ${historyItem.changedBy.name}`}
                                            </p>
                                        )}

                                        {index < statusOrder.length - 1 && (
                                            <div className="timeline-line" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="request-secondary-grid">
                <section className="request-comments-card">
                    <div className="details-card-header">
                        <h3>
                            <FiMessageSquare />
                            Comments
                        </h3>
                    </div>

                    <div className="comments-list">
                        {commentsLoading ? (
                            <p className="empty-detail">
                                Loading comments...
                            </p>
                        ) : commentsError ? (
                            <p className="empty-detail comment-error">
                                {commentsError}
                            </p>
                        ) : comments.length === 0 ? (
                            <p className="empty-detail">
                                No comments yet.
                            </p>
                        ) : (
                            comments.map((item, index) => (
                                <div
                                    className="comment-item"
                                    key={
                                        item._id ||
                                        `${item.createdAt}-${index}`
                                    }
                                >
                                    <strong>
                                        {item.user?.name || "User"}
                                    </strong>

                                    <span>
                                        {formatDate(
                                            item.createdAt,
                                            true
                                        )}
                                    </span>

                                    <p>{item.text}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {canComment && (
                        <form
                            className="comment-form"
                            onSubmit={addComment}
                        >
                            <textarea
                                value={comment}
                                onChange={(event) =>
                                    setComment(event.target.value)
                                }
                                placeholder="Add a comment..."
                                maxLength={1000}
                                rows={3}
                            />

                            <button
                                type="submit"
                                disabled={
                                    commentLoading ||
                                    commentsLoading ||
                                    !comment.trim()
                                }
                            >
                                {commentLoading
                                    ? "Adding..."
                                    : "Add Comment"}
                            </button>
                        </form>
                    )}
                </section>

                {isUser && request.status === "Closed" && (
                    <section className="request-feedback-card">
                        <div className="details-card-header">
                            <h3>Feedback</h3>
                        </div>

                        {feedback ? (
                            <div className="feedback-result">
                                <strong>
                                    {"★".repeat(feedback.rating)}
                                    {"☆".repeat(5 - feedback.rating)}
                                </strong>

                                <p>
                                    {feedback.comment ||
                                        "Thank you for your feedback."}
                                </p>
                            </div>
                        ) : (
                            <form
                                className="feedback-form"
                                onSubmit={submitFeedback}
                            >
                                <label>Rating</label>

                                <select
                                    value={feedbackRating}
                                    onChange={(event) =>
                                        setFeedbackRating(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="5">
                                        5 - Excellent
                                    </option>
                                    <option value="4">
                                        4 - Good
                                    </option>
                                    <option value="3">
                                        3 - Average
                                    </option>
                                    <option value="2">
                                        2 - Poor
                                    </option>
                                    <option value="1">
                                        1 - Very poor
                                    </option>
                                </select>

                                <textarea
                                    value={feedbackComment}
                                    onChange={(event) =>
                                        setFeedbackComment(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Tell us about your experience..."
                                    rows={3}
                                />

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? "Submitting..."
                                        : "Submit Feedback"}
                                </button>
                            </form>
                        )}
                    </section>
                )}

                {!isUser && (
                    <section className="request-feedback-card">
                        <div className="details-card-header">
                            <h3>Access</h3>
                        </div>

                        <p className="empty-detail">
                            {role === "staff"
                                ? "Assigned request collaboration is available through comments."
                                : "Administrator view: request information and history."}
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
};

export default RequestDetails;
