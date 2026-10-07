import { useState } from "react";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./CreateRequest.css";

const CreateRequest = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        priority: "Medium"
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        if (!formData.title.trim()) {
            setError("Please enter a request title.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Please enter a description.");
            return;
        }

        if (!formData.category) {
            setError("Please select a category.");
            return;
        }

        try {

            setLoading(true);

            await api.post("/requests", {
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category,
                priority: formData.priority
            });

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

    return (
        <div className="create-request-page">

            <div className="create-request-header">

                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate("/user/requests")}
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

            <div className="create-request-card">

                <form onSubmit={handleSubmit}>

                    <div className="form-section">

                        <h3>
                            Request Information
                        </h3>

                        <p>
                            Provide the details of the issue or
                            service you need.
                        </p>

                    </div>

                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}

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

                    <div className="form-row">

                        <div className="form-group">

                            <label htmlFor="category">
                                Category
                            </label>

                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select category
                                </option>

                                <option value="IT Support">
                                    IT Support
                                </option>

                                <option value="Maintenance">
                                    Maintenance
                                </option>

                                <option value="HR">
                                    HR
                                </option>

                                <option value="Finance">
                                    Finance
                                </option>

                                <option value="General">
                                    General
                                </option>

                            </select>

                        </div>

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
                            disabled={loading}
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