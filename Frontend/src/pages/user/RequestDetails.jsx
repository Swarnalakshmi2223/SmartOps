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

const getTimelineState = (index, currentIndex) => {
    if (index < currentIndex) {
        return "completed";
    }

    if (index === currentIndex) {
        return "current";
    }

    return "upcoming";
};

const TimelineIcon = ({ state }) => {
    if (state === "completed") {
        return <FiCheckCircle />;
    }

    if (state === "current") {
        return <FiClock />;
    }

    return <span />;
};

const StatusTimeline = ({ request, formatDate }) => {
    const currentIndex = statusOrder.indexOf(request.status);

    return (
        <div className="request-timeline-card">
            <div className="details-card-header">
                <h3>Status History</h3>
            </div>

            <div className="timeline">
                {statusOrder.map((step, index) => {
                    const state = getTimelineState(index, currentIndex);
                    const historyItem = (request.statusHistory || [])
                        .find((item) => item.status === step);

                    return (
                        <div
                            className={`timeline-item ${state}`}
                            key={step}
                        >
                            <div className="timeline-icon">
                                <TimelineIcon state={state} />
                            </div>

                            <div className="timeline-content">
                                <strong>{step}</strong>

                                {historyItem && (
                                    <p>
                                        {formatDate(historyItem.changedAt, true)}
                                        {historyItem.changedBy?.name &&
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
    );
};

const CommentsCard = ({
    comments,
    commentsLoading,
    commentsError,
    canComment,
    comment,
    commentLoading,
    onCommentChange,
    onSubmit,
    formatDate
}) => {
    let commentsContent;

    if (commentsLoading) {
        commentsContent = <p className="empty-detail">Loading comments...</p>;
    } else if (commentsError) {
        commentsContent = (
            <p className="empty-detail comment-error">{commentsError}</p>
        );
    } else if (comments.length === 0) {
        commentsContent = <p className="empty-detail">No comments yet.</p>;
    } else {
        commentsContent = comments.map((item, index) => (
            <div
                className="comment-item"
                key={item._id || `${item.createdAt}-${index}`}
            >
                <strong>{item.user?.name || "User"}</strong>
                <span>{formatDate(item.createdAt, true)}</span>
                <p>{item.text}</p>
            </div>
        ));
    }

    return (
        <section className="request-comments-card">
            <div className="details-card-header">
                <h3>
                    <FiMessageSquare />
                    Comments
                </h3>
            </div>

            <div className="comments-list">{commentsContent}</div>

            {canComment && (
                <form className="comment-form" onSubmit={onSubmit}>
                    <textarea
                        value={comment}
                        onChange={onCommentChange}
                        placeholder="Add a comment..."
                        maxLength={1000}
                        rows={3}
                    />

                    <button
                        type="submit"
                        disabled={commentLoading || commentsLoading || !comment.trim()}
                    >
                        {commentLoading ? "Adding..." : "Add Comment"}
                    </button>
                </form>
            )}
        </section>
    );
};

const FeedbackCard = ({
    feedback,
    feedbackRating,
    feedbackComment,
    actionLoading,
    onRatingChange,
    onCommentChange,
    onSubmit
}) => (
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

                <p>{feedback.comment || "Thank you for your feedback."}</p>
            </div>
        ) : (
            <form className="feedback-form" onSubmit={onSubmit}>
                <label htmlFor="feedback-rating">Rating</label>
                <select id="feedback-rating" value={feedbackRating} onChange={onRatingChange}>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Very poor</option>
                </select>

                <textarea
                    value={feedbackComment}
                    onChange={onCommentChange}
                    placeholder="Tell us about your experience..."
                    rows={3}
                />

                <button type="submit" disabled={actionLoading}>
                    {actionLoading ? "Submitting..." : "Submit Feedback"}
                </button>
            </form>
        )}
    </section>
);

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
    const [fileLoading, setFileLoading] = useState("");
    const [fileError, setFileError] = useState("");

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
    }, [request]);

    const hasEvidenceFile =
        typeof request?.resolutionEvidence === "string" &&
        /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|pdf|doc|docx)$/i.test(
            request.resolutionEvidence
        );

    const openProtectedFile = async (url, filename, fileType) => {
        const previewWindow = window.open("", "_blank");

        try {
            setFileLoading(fileType);
            setFileError("");

            const response = await api.get(url, {
                responseType: "blob"
            });
            const objectUrl = URL.createObjectURL(response.data);

            if (previewWindow) {
                previewWindow.location.href = objectUrl;
                window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
                return;
            }

            const downloadLink = document.createElement("a");
            downloadLink.href = objectUrl;
            downloadLink.download = filename || "SmartOps-file";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch (fileFetchError) {
            previewWindow?.close();
            console.error(`Failed to fetch ${fileType}:`, fileFetchError);
            setFileError(
                fileFetchError.response?.data?.message ||
                    `Unable to open ${fileType}. The file may be unavailable or you may not have access.`
            );
        } finally {
            setFileLoading("");
        }
    };

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
                            <span className="detail-label">Description</span>
                            <p className="request-description">
                                {request.description}
                            </p>
                        </div>

                        <div className="detail-row">
                            <div className="detail-item">
                                <span className="detail-label">Category</span>
                                <span>{request.category || "-"}</span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Department</span>
                                <span>
                                    {request.department ||
                                        request.aiDepartment ||
                                        "-"}
                                </span>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-item">
                                <span className="detail-label">Location</span>
                                <span>{request.location || "-"}</span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Assigned Staff</span>
                                <span>
                                    {request.assignedTo?.name ||
                                        "Not assigned"}
                                </span>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-item">
                                <span className="detail-label">Created</span>
                                <span>
                                    {formatDate(request.createdAt, true)}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Request Number</span>
                                <span>
                                    {request.requestNumber || request._id}
                                </span>
                            </div>
                        </div>

                        {request.attachment && (
                            <div className="attachment-box">
                                <span className="detail-label attachment-label">
                                    <FiPaperclip />
                                    Attachment
                                </span>

                                <button
                                    type="button"
                                    onClick={() => openProtectedFile(
                                        attachmentUrl,
                                        request.attachmentOriginalName ||
                                            request.attachment,
                                        "attachment"
                                    )}
                                    disabled={fileLoading === "attachment"}
                                >
                                    <FiDownload />
                                    {fileLoading === "attachment"
                                        ? "Opening attachment..."
                                        : `View or download ${request.attachmentOriginalName || request.attachment}`}
                                </button>

                                {fileError && (
                                    <p className="file-error">{fileError}</p>
                                )}
                            </div>
                        )}

                        {request.resolution && (
                            <div className="resolution-box">
                                <span className="detail-label">Resolution</span>
                                <p>{request.resolution}</p>
                            </div>
                        )}

                        {request.resolutionEvidence && (
                            <div className="resolution-box">
                                <span className="detail-label">Resolution Evidence</span>
                                {hasEvidenceFile ? (
                                    <button
                                        type="button"
                                        onClick={() => openProtectedFile(
                                            evidenceUrl,
                                            request.resolutionEvidence,
                                            "resolution evidence"
                                        )}
                                        disabled={
                                            fileLoading === "resolution evidence"
                                        }
                                    >
                                        <FiDownload />
                                        {fileLoading === "resolution evidence"
                                            ? "Opening resolution evidence..."
                                            : "View resolution evidence"}
                                    </button>
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

                <StatusTimeline request={request} formatDate={formatDate} />
            </div>

            <div
                className={`request-secondary-grid ${
                    isUser && request.status === "Closed"
                        ? ""
                        : "single-column"
                }`}
            >
                <CommentsCard
                    comments={comments}
                    commentsLoading={commentsLoading}
                    commentsError={commentsError}
                    canComment={canComment}
                    comment={comment}
                    commentLoading={commentLoading}
                    onCommentChange={(event) => setComment(event.target.value)}
                    onSubmit={addComment}
                    formatDate={formatDate}
                />

                {isUser && request.status === "Closed" && (
                    <FeedbackCard
                        feedback={feedback}
                        feedbackRating={feedbackRating}
                        feedbackComment={feedbackComment}
                        actionLoading={actionLoading}
                        onRatingChange={(event) => setFeedbackRating(event.target.value)}
                        onCommentChange={(event) => setFeedbackComment(event.target.value)}
                        onSubmit={submitFeedback}
                    />
                )}

            </div>
        </div>
    );
};

export default RequestDetails;
