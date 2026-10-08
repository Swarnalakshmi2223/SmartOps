import { useState, useEffect } from "react";
import { FiArrowLeft, FiSend, FiZap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./CreateRequest.css";

const departmentOptions = [
    "IT & Technical Support",
    "Maintenance",
    "Housekeeping",
    "Security",
    "General"
];

const allowedAttachmentTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const maximumAttachmentSize = 5 * 1024 * 1024;

const CreateRequest = () => {
    const navigate = useNavigate();

    // --------------------------------------------------
    // Form state
    // --------------------------------------------------
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        priority: "Medium",
        department: "",
        location: ""
    });

    // --------------------------------------------------
    // General states
    // --------------------------------------------------
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [attachment, setAttachment] = useState(null);

    // --------------------------------------------------
    // Category states
    // --------------------------------------------------
    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(true);

    // --------------------------------------------------
    // AI states
    // --------------------------------------------------
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiMessage, setAiMessage] = useState("");

    // ==================================================
    // Fetch active categories from backend
    // ==================================================
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoryLoading(true);

                const response = await api.get("/categories/active");

                const fetchedCategories =
                    response.data.categories || [];

                setCategories(fetchedCategories);

            } catch (error) {
                console.error(
                    "Failed to load categories:",
                    error
                );

                setCategories([]);

                setAiMessage(
                    "Categories could not be loaded. Please refresh the page and try again."
                );
            } finally {
                setCategoryLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // ==================================================
    // Handle form field changes
    // ==================================================
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

        // Clear normal form error when user edits
        if (error) {
            setError("");
        }
    };

    const handleAttachmentChange = (event) => {
        const selectedFile = event.target.files?.[0] || null;

        if (!selectedFile) {
            setAttachment(null);
            return;
        }

        if (!allowedAttachmentTypes.includes(selectedFile.type)) {
            setAttachment(null);
            event.target.value = "";
            setError("Only JPG, PNG, WEBP, PDF, DOC, and DOCX files are allowed.");
            return;
        }

        if (selectedFile.size > maximumAttachmentSize) {
            setAttachment(null);
            event.target.value = "";
            setError("Attachment must be 5 MB or smaller.");
            return;
        }

        if (selectedFile.size === 0) {
            setAttachment(null);
            event.target.value = "";
            setError("Attachment cannot be empty.");
            return;
        }

        setAttachment(selectedFile);

        if (error) {
            setError("");
        }
    };

    // ==================================================
    // Ask AI for category + priority suggestion
    // ==================================================
    const handleAISuggest = async () => {
        setAiMessage("");
        setAiSuggestion(null);

        if (!formData.title.trim() || !formData.description.trim()) {
            setAiMessage(
                "Enter a title and description first, then ask AI for a suggestion."
            );
            return;
        }

        try {
            setAiLoading(true);

            const response = await api.post("/ai/analyze", {
                title: formData.title.trim(),
                description: formData.description.trim()
            });

            const analysis = response.data.analysis;

            if (!analysis) {
                setAiMessage(
                    "AI did not return a suggestion. You can choose the category manually."
                );
                return;
            }

            setAiSuggestion(analysis);

        } catch (error) {
            console.error(
                "AI suggestion error:",
                error
            );

            setAiMessage(
                error.response?.data?.message ||
                "AI suggestion is unavailable right now. You can still choose a category yourself."
            );

        } finally {
            setAiLoading(false);
        }
    };

    // ==================================================
    // Normalize category names
    // ==================================================
    const normalizeCategory = (value) => {
        return String(value || "")
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    };

    // ==================================================
    // Find category matching AI suggestion
    // ==================================================
    const findMatchingCategory = (suggestedCategory) => {
        const normalizedSuggestion =
            normalizeCategory(suggestedCategory);

        if (!normalizedSuggestion) {
            return null;
        }

        // --------------------------------------------------
        // 1. Exact normalized match
        // --------------------------------------------------
        const exactMatch = categories.find((category) => {
            const categoryName =
                typeof category === "string"
                    ? category
                    : category?.name || "";

            return (
                normalizeCategory(categoryName) ===
                normalizedSuggestion
            );
        });

        if (exactMatch) {
            return exactMatch;
        }

        // --------------------------------------------------
        // 2. Known AI/category aliases
        // --------------------------------------------------
        const categoryAliases = {
            "it and technical support": [
                "it support",
                "technical support",
                "it technical support"
            ],

            "maintenance": [
                "maintenance"
            ],

            "housekeeping": [
                "housekeeping"
            ],

            "security": [
                "security"
            ],

            "other": [
                "other",
                "general"
            ]
        };

        const aliases =
            categoryAliases[normalizedSuggestion] || [];

        if (aliases.length === 0) {
            return null;
        }

        const aliasMatch = categories.find((category) => {
            const categoryName =
                typeof category === "string"
                    ? category
                    : category?.name || "";

            return aliases.includes(
                normalizeCategory(categoryName)
            );
        });

        return aliasMatch || null;
    };

    // ==================================================
    // Apply AI suggestion to form
    // ==================================================
    const applyAISuggestion = () => {
        if (!aiSuggestion) {
            return;
        }

        const suggestedCategory = String(
            aiSuggestion.category || ""
        ).trim();

        const suggestedPriority = String(
            aiSuggestion.priority || ""
        ).trim();

        const suggestedDepartment = String(
            aiSuggestion.department || ""
        ).trim();

        const matchedCategory =
            findMatchingCategory(suggestedCategory);

        setFormData((previousData) => ({
            ...previousData,

            // Apply matching database category
            category: matchedCategory
                ? typeof matchedCategory === "string"
                    ? matchedCategory.trim()
                    : String(matchedCategory.name || "").trim()
                : previousData.category,

            // Always apply valid AI priority
            priority: [
                "Low",
                "Medium",
                "High",
                "Critical"
            ].includes(suggestedPriority)
                ? suggestedPriority
                : previousData.priority,

            department: departmentOptions.includes(suggestedDepartment)
                ? suggestedDepartment
                : previousData.department
        }));

        if (matchedCategory) {
            setAiMessage(
                "AI suggestion applied successfully."
            );
        } else {
            setAiMessage(
                `AI suggested "${suggestedCategory}", but no matching active category was found. Please choose the category manually.`
            );
        }
    };

    // ==================================================
    // Submit request
    // ==================================================
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setAiMessage("");

        // Validate title
        if (!formData.title.trim()) {
            setError("Please enter a request title.");
            return;
        }

        // Validate description
        if (!formData.description.trim()) {
            setError("Please enter a description.");
            return;
        }

        // Validate category
        if (!formData.category) {
            setError("Please select a category.");
            return;
        }

        try {
            setLoading(true);

            const requestFields = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category,
                priority: formData.priority,
                department: formData.department,
                location: formData.location.trim()
            };

            if (attachment) {
                const multipartData = new FormData();

                Object.entries(requestFields).forEach(([key, value]) => {
                    multipartData.append(key, value);
                });

                multipartData.append("attachment", attachment);

                await api.post("/requests", multipartData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            } else {
                await api.post("/requests", requestFields);
            }

            navigate("/user/requests");

        } catch (error) {
            console.error(
                "Failed to create request:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to create request."
            );

        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // Render
    // ==================================================
    return (
        <div className="create-request-page">

            {/* ==========================================
                Header
            ========================================== */}
            <div className="create-request-header">

                <button
                    type="button"
                    className="back-button"
                    onClick={() =>
                        navigate("/user/requests")
                    }
                >
                    <FiArrowLeft />
                    Back to Requests
                </button>

                <div>
                    <h2>
                        Create Service Request
                    </h2>

                    <p>
                        Submit a new request to the support team.
                    </p>
                </div>

            </div>

            {/* ==========================================
                Main card
            ========================================== */}
            <div className="create-request-card">

                <form onSubmit={handleSubmit}>

                    {/* ======================================
                        Request information
                    ====================================== */}
                    <div className="form-section">

                        <h3>
                            Request Information
                        </h3>

                        <p>
                            Provide the details of the issue or
                            service you need.
                        </p>

                    </div>

                    {/* ======================================
                        Form error
                    ====================================== */}
                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}

                    {/* ======================================
                        Request Title
                    ====================================== */}
                    <div className="form-group">

                        <label htmlFor="title">
                            Request Title
                        </label>

                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="Example: Unable to access company email"
                            value={formData.title}
                            onChange={handleChange}
                        />

                    </div>

                    {/* ======================================
                        Description
                    ====================================== */}
                    <div className="form-group">

                        <label htmlFor="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            rows="6"
                            placeholder="Describe your issue clearly..."
                            value={formData.description}
                            onChange={handleChange}
                        />

                    </div>

                    {/* ======================================
                        AI Assistant
                    ====================================== */}
                    <div className="ai-suggest-box">

                        <div className="ai-suggest-top">

                            <div>
                                <strong>
                                    AI assistant
                                </strong>

                                <span>
                                    Get a suggested category and priority
                                    from your description.
                                </span>
                            </div>

                            <button
                                type="button"
                                className="ai-suggest-button"
                                onClick={handleAISuggest}
                                disabled={
                                    aiLoading ||
                                    categoryLoading
                                }
                            >
                                <FiZap />

                                {aiLoading
                                    ? "Analyzing..."
                                    : "Suggest with AI"}
                            </button>

                        </div>

                        {/* AI message */}
                        {aiMessage && (
                            <p className="ai-suggest-note">
                                {aiMessage}
                            </p>
                        )}

                        {/* AI result */}
                        {aiSuggestion && (
                            aiSuggestion.categoryScore === 0 ? (
                                <p className="ai-suggest-note">
                                    AI could not find a confident match.
                                    Please choose the category yourself.
                                </p>
                            ) : (
                                <div className="ai-suggest-result">

                                    <div>
                                        <span>
                                            Suggested category
                                        </span>

                                        <strong>
                                            {aiSuggestion.category}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Suggested priority
                                        </span>

                                        <strong>
                                            {aiSuggestion.priority}
                                        </strong>
                                    </div>

                                    <button
                                        type="button"
                                        className="ai-apply-button"
                                        onClick={applyAISuggestion}
                                    >
                                        Apply
                                    </button>

                                </div>
                            )
                        )}

                    </div>

                    {/* ======================================
                        Category + Priority
                    ====================================== */}
                    <div className="form-row">

                        {/* Category */}
                        <div className="form-group">

                            <label htmlFor="category">
                                Category
                            </label>

                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                disabled={categoryLoading}
                            >

                                <option value="">
                                    {categoryLoading
                                        ? "Loading categories..."
                                        : "Select category"}
                                </option>

                                {!categoryLoading &&
                                    categories.map((category) => {

                                        const categoryName =
                                            typeof category === "string"
                                                ? category
                                                : category?.name || "";

                                        const categoryId =
                                            typeof category === "string"
                                                ? category
                                                : category?._id || categoryName;

                                        return (
                                            <option
                                                key={categoryId}
                                                value={categoryName}
                                            >
                                                {categoryName}
                                            </option>
                                        );
                                    })
                                }

                            </select>

                        </div>

                        {/* Priority */}
                        <div className="form-group">

                            <label htmlFor="priority">
                                Priority
                            </label>

                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                            >

                                <option value="Low">
                                    Low
                                </option>

                                <option value="Medium">
                                    Medium
                                </option>

                                <option value="High">
                                    High
                                </option>

                                <option value="Critical">
                                    Critical
                                </option>

                            </select>

                        </div>

                    </div>

                    <div className="form-row">

                        <div className="form-group">
                            <label htmlFor="department">
                                Department
                            </label>

                            <select
                                id="department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select department
                                </option>

                                {departmentOptions.map((department) => (
                                    <option key={department} value={department}>
                                        {department}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">
                                Location
                            </label>

                            <input
                                id="location"
                                name="location"
                                type="text"
                                placeholder="Example: First floor, Block A"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    <div className="form-group">
                        <label htmlFor="attachment">
                            Attachment
                        </label>

                        <input
                            id="attachment"
                            name="attachment"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                            onChange={handleAttachmentChange}
                        />

                        <small>
                            Optional. JPG, PNG, WEBP, PDF, DOC, or DOCX up to 5 MB.
                        </small>
                    </div>

                    {/* ======================================
                        Form actions
                    ====================================== */}
                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                                navigate("/user/requests")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="submit-request-button"
                            disabled={
                                loading ||
                                categoryLoading
                            }
                        >
                            <FiSend />

                            {loading
                                ? "Submitting..."
                                : "Submit Request"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default CreateRequest;
