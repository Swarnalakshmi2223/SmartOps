import { useEffect, useState } from "react";
import { FiStar, FiMessageSquare } from "react-icons/fi";

import api from "../../services/api";

import "./AdminFeedback.css";

const AdminFeedback = () => {

    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/feedback");

            setFeedbackList(response.data.feedback || []);

        } catch (error) {
            console.error("Failed to fetch feedback:", error);
            setError(
                error.response?.data?.message ||
                "Failed to load feedback."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const averageRating = feedbackList.length > 0
        ? (
            feedbackList.reduce((sum, f) => sum + f.rating, 0) /
            feedbackList.length
        ).toFixed(1)
        : "0.0";

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <FiStar
                key={index}
                className={
                    index < rating
                        ? "admin-feedback-star filled"
                        : "admin-feedback-star"
                }
            />
        ));
    };

    return (
        <div className="admin-feedback-page">

            <div className="admin-feedback-header">
                <div>
                    <h2>Feedback</h2>
                    <p>User feedback and service ratings after resolution.</p>
                </div>

                <div className="admin-feedback-average">
                    <span>Average rating</span>
                    <strong>{averageRating} / 5</strong>
                </div>
            </div>

            {loading && (
                <div className="admin-feedback-message">Loading feedback...</div>
            )}

            {error && !loading && (
                <div className="admin-feedback-error">{error}</div>
            )}

            {!loading && !error && (
                feedbackList.length === 0 ? (
                    <div className="admin-feedback-empty">
                        <FiMessageSquare />
                        <h4>No feedback yet</h4>
                        <p>Feedback appears here once users rate a closed request.</p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-feedback-table">
                            <thead>
                                <tr>
                                    <th>Request</th>
                                    <th>Submitted by</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbackList.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            <strong>
                                                {item.requestId?.title || "Deleted request"}
                                            </strong>
                                        </td>
                                        <td>
                                            {item.userId?.name || "Unknown"}
                                        </td>
                                        <td>
                                            <div className="admin-feedback-stars">
                                                {renderStars(item.rating)}
                                            </div>
                                        </td>
                                        <td className="admin-feedback-comment">
                                            {item.comment || "-"}
                                        </td>
                                        <td>{formatDate(item.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

        </div>
    );
};

export default AdminFeedback;