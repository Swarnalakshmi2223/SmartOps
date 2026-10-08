import { useEffect, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiRefreshCw, FiXCircle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

import "./AdminAIReview.css";

const AdminAIReview = () => {
    const navigate = useNavigate();
    const { requestId } = useParams();
    const [review, setReview] = useState(null);
    const [originalRequest, setOriginalRequest] = useState(null);
    const [duplicates, setDuplicates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [draft, setDraft] = useState({ category: "", department: "", priority: "Medium" });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const formatDate = (date) => date
        ? new Date(date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : "-";

    const fetchReview = async () => {
        try {
            setLoading(true);
            setError("");

            const [reviewResponse, originalResponse] = await Promise.all([
                api.get(`/ai-review/${requestId}`),
                api.get(`/requests/${requestId}`)
            ]);
            const aiRequest = reviewResponse.data.request;
            const original = originalResponse.data.request;
            const duplicateResults = await Promise.all(
                (aiRequest.aiDuplicates || []).map(async (duplicate) => {
                    try {
                        const response = await api.get(`/requests/${duplicate.requestId}`);
                        return { ...duplicate, request: response.data.request };
                    } catch {
                        return { ...duplicate, request: null };
                    }
                })
            );

            setReview(aiRequest);
            setOriginalRequest(original);
            setDuplicates(duplicateResults);
            setDraft({
                category: original.category || "",
                department: original.department || aiRequest.aiDepartment || "",
                priority: original.priority || "Medium"
            });
        } catch (requestError) {
            console.error("Failed to load AI review:", requestError);
            setError(requestError.response?.data?.message || "Failed to load AI review.");
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [categoryResponse, departmentResponse] = await Promise.all([
                api.get("/categories"),
                api.get("/departments")
            ]);
            setCategories((categoryResponse.data.categories || []).filter((item) => item.isActive !== false));
            setDepartments((departmentResponse.data.departments || []).filter((item) => item.isActive !== false));
        } catch (optionsError) {
            console.error("Failed to load AI review options:", optionsError);
        }
    };

    useEffect(() => {
        fetchReview();
        fetchOptions();
    }, [requestId]);

    const reviewSuggestion = async (action) => {
        try {
            setActionLoading(true);
            setError("");
            setSuccess("");
            const response = await api.patch(
                `/ai-review/${requestId}`,
                action === "accept"
                    ? { action: "accept" }
                    : { action: "modified", ...draft }
            );
            await fetchReview();
            setSuccess(response.data.message || "AI review saved successfully.");
        } catch (reviewError) {
            setError(reviewError.response?.data?.message || "Failed to save AI review.");
        } finally {
            setActionLoading(false);
        }
    };

    const reviewDuplicate = async (duplicateRequestId, decision) => {
        try {
            setActionLoading(true);
            setError("");
            setSuccess("");
            const response = await api.patch(
                `/ai-review/${requestId}/duplicate/${duplicateRequestId}`,
                { decision }
            );
            await fetchReview();
            setSuccess(response.data.message || "Duplicate review saved successfully.");
        } catch (duplicateError) {
            setError(duplicateError.response?.data?.message || "Failed to review duplicate suggestion.");
        } finally {
            setActionLoading(false);
        }
    };

    const updateDraft = (field, value) => {
        setDraft((current) => ({ ...current, [field]: value }));
    };

    if (loading) return <div className="admin-ai-review-message">Loading AI review...</div>;
    if (error && !review) return <div className="admin-ai-review-error">{error}</div>;
    if (!review || !originalRequest) return <div className="admin-ai-review-message">AI review is not available for this request.</div>;

    return (
        <div className="admin-ai-review-page">
            <button type="button" className="admin-ai-review-back" onClick={() => navigate("/admin/requests")}>
                <FiArrowLeft /> Back to Requests
            </button>

            <div className="admin-ai-review-header">
                <div>
                    <span>Administrator review</span>
                    <h2>AI Request Review</h2>
                    <p>AI suggestions are advisory. An administrator must make the final decision.</p>
                </div>
                <button type="button" className="admin-ai-refresh-button" onClick={fetchReview} disabled={actionLoading}>
                    <FiRefreshCw /> Refresh
                </button>
            </div>

            {error && <div className="admin-ai-review-error">{error}</div>}
            {success && <div className="admin-ai-review-success">{success}</div>}

            <section className="admin-ai-card">
                <div className="admin-ai-card-header">
                    <div><span>Original request</span><h3>{originalRequest.title}</h3></div>
                    <span className="admin-ai-status-badge">{originalRequest.status}</span>
                </div>
                <div className="admin-ai-meta-grid">
                    <div><label>Request number</label><strong>{originalRequest.requestNumber || originalRequest._id}</strong></div>
                    <div><label>Category</label><strong>{originalRequest.category || "-"}</strong></div>
                    <div><label>Department</label><strong>{originalRequest.department || "-"}</strong></div>
                    <div><label>Priority</label><strong>{originalRequest.priority || "-"}</strong></div>
                    <div><label>Created</label><strong>{formatDate(originalRequest.createdAt)}</strong></div>
                    <div><label>AI analyzed</label><strong>{formatDate(review.aiAnalyzedAt)}</strong></div>
                </div>
                <p className="admin-ai-description">{originalRequest.description || "No description available."}</p>
            </section>

            <section className="admin-ai-card">
                <div className="admin-ai-card-header">
                    <div><span>AI suggestion</span><h3>Classification review</h3></div>
                    <span className={`admin-ai-review-status ${review.aiReviewed ? "reviewed" : "pending"}`}>
                        {review.aiReviewed ? review.aiReviewAction : "pending"}
                    </span>
                </div>
                <div className="admin-ai-suggestion-grid">
                    <div><label>AI category</label><strong>{review.aiCategory || "-"}</strong><small>Confidence score: {review.aiCategoryScore ?? 0}</small></div>
                    <div><label>AI department</label><strong>{review.aiDepartment || "-"}</strong><small>Confidence score: {review.aiDepartmentScore ?? 0}</small></div>
                    <div><label>AI priority</label><strong>{review.aiPriority || "-"}</strong><small>Confidence score: {review.aiPriorityScore ?? 0}</small></div>
                </div>
                <div className="admin-ai-edit-grid">
                    <label>Final category<select value={draft.category} onChange={(event) => updateDraft("category", event.target.value)}><option value="">Select category</option>{categories.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}{draft.category && !categories.some((item) => item.name === draft.category) && <option value={draft.category}>{draft.category}</option>}</select></label>
                    <label>Final department<select value={draft.department} onChange={(event) => updateDraft("department", event.target.value)}><option value="">Select department</option>{departments.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}{draft.department && !departments.some((item) => item.name === draft.department) && <option value={draft.department}>{draft.department}</option>}</select></label>
                    <label>Final priority<select value={draft.priority} onChange={(event) => updateDraft("priority", event.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label>
                </div>
                <div className="admin-ai-actions">
                    <button type="button" className="admin-ai-accept-button" disabled={actionLoading || !review.aiAnalyzedAt} onClick={() => reviewSuggestion("accept")}><FiCheckCircle /> Accept AI suggestion</button>
                    <button type="button" className="admin-ai-modify-button" disabled={actionLoading || !draft.category || !draft.department || !draft.priority} onClick={() => reviewSuggestion("modified")}>Save modified decision</button>
                </div>
            </section>

            <section className="admin-ai-card">
                <div className="admin-ai-card-header">
                    <div><span>AI duplicate detection</span><h3>Suspected duplicates</h3></div>
                    <strong>{duplicates.length} suggestion{duplicates.length === 1 ? "" : "s"}</strong>
                </div>
                {duplicates.length === 0 ? (
                    <p className="admin-ai-empty">No duplicate suggestions were detected for this request.</p>
                ) : (
                    <div className="admin-ai-duplicates">
                        {duplicates.map((duplicate) => {
                            const duplicateRequest = duplicate.request;
                            return (
                                <article className="admin-ai-duplicate" key={duplicate.requestId}>
                                    <div className="admin-ai-duplicate-header">
                                        <div><span>Suspected duplicate</span><h4>{duplicateRequest?.title || duplicate.title || "Unavailable request"}</h4></div>
                                        <strong>{duplicate.similarity ?? 0}% overlap</strong>
                                    </div>
                                    {duplicateRequest ? (
                                        <div className="admin-ai-meta-grid">
                                            <div><label>Category</label><strong>{duplicateRequest.category || "-"}</strong></div>
                                            <div><label>Department</label><strong>{duplicateRequest.department || "-"}</strong></div>
                                            <div><label>Priority</label><strong>{duplicateRequest.priority || "-"}</strong></div>
                                            <div><label>Status</label><strong>{duplicateRequest.status || "-"}</strong></div>
                                            <div><label>Created</label><strong>{formatDate(duplicateRequest.createdAt)}</strong></div>
                                        </div>
                                    ) : <p className="admin-ai-empty">The suspected request is no longer available.</p>}
                                    <div className="admin-ai-duplicate-footer">
                                        <span className={`admin-ai-decision ${duplicate.decision || "pending"}`}>{duplicate.decision || "pending"}</span>
                                        <div className="admin-ai-actions">
                                            <button type="button" className="admin-ai-reject-button" disabled={actionLoading || duplicate.decision === "rejected"} onClick={() => reviewDuplicate(duplicate.requestId, "rejected")}><FiXCircle /> Reject duplicate</button>
                                            <button type="button" className="admin-ai-confirm-button" disabled={actionLoading || duplicate.decision === "confirmed"} onClick={() => reviewDuplicate(duplicate.requestId, "confirmed")}><FiCheckCircle /> Confirm duplicate</button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminAIReview;
