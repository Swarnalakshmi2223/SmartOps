import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiToggleLeft, FiToggleRight, FiTrash2 } from "react-icons/fi";

import api from "../../services/api";

import "./AdminCategories.css";

const AdminCategories = () => {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionId, setActionId] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/categories");

            setCategories(response.data.categories || []);

        } catch (error) {
            console.error("Failed to fetch categories:", error);
            setError(
                error.response?.data?.message ||
                "Failed to load categories."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const openCreateForm = () => {
        setEditingId(null);
        setFormData({ name: "", description: "" });
        setShowForm(true);
    };

    const openEditForm = (category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            description: category.description || ""
        });
        setShowForm(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            setError("Category name is required.");
            return;
        }

        try {
            if (editingId) {
                await api.put(`/categories/${editingId}`, formData);
            } else {
                await api.post("/categories", formData);
            }

            setShowForm(false);
            fetchCategories();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to save category."
            );
        }
    };

    const toggleStatus = async (category) => {
        if (actionId) return;
        try {
            setActionId(category._id);
            await api.patch(`/categories/${category._id}/status`, {
                isActive: !category.isActive
            });

            fetchCategories();

        } catch (error) {
            setError(error.response?.data?.message || "Failed to update category status.");
        } finally {
            setActionId(null);
        }
    };

    const removeCategory = async (category) => {
        if (actionId) return;
        const confirmed = window.confirm(
            `Remove category “${category.name}”? This permanently deletes it only when no historical requests reference it. Referenced categories are protected and must be deactivated instead.`
        );
        if (!confirmed) return;

        try {
            setActionId(category._id);
            setError("");
            await api.delete(`/categories/${category._id}`);
            setCategories((previous) => previous.filter((item) => item._id !== category._id));
        } catch (error) {
            setError(error.response?.data?.message || "Failed to remove category.");
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="admin-categories">

            <div className="admin-categories-header">
                <div>
                    <h2>Categories</h2>
                    <p>Manage the categories users can select for a request.</p>
                </div>

                <button
                    type="button"
                    className="admin-categories-add-btn"
                    onClick={openCreateForm}
                >
                    <FiPlus />
                    Add category
                </button>
            </div>

            {error && (
                <div className="admin-categories-error">{error}</div>
            )}

            {showForm && (
                <div className="admin-categories-form-overlay">
                    <form
                        className="admin-categories-form"
                        onSubmit={handleSubmit}
                    >
                        <h3>
                            {editingId ? "Edit category" : "New category"}
                        </h3>

                        <label htmlFor="category-name">Name</label>
                        <input
                            type="text"
                            id="category-name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Network issue"
                        />

                        <label htmlFor="category-description">Description</label>
                        <textarea
                            id="category-description"
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Optional description"
                        />

                        <div className="admin-categories-form-actions">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="primary">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="admin-categories-message">Loading...</div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-categories-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category._id}>
                                    <td><strong>{category.name}</strong></td>
                                    <td>{category.description || "-"}</td>
                                    <td>
                                        <span
                                            className={
                                                category.isActive
                                                    ? "status-active"
                                                    : "status-inactive"
                                            }
                                        >
                                            {category.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="admin-categories-actions">
                                        <button
                                            type="button"
                                            onClick={() => openEditForm(category)}
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleStatus(category)}
                                            disabled={actionId === category._id}
                                        >
                                            {category.isActive
                                                ? <FiToggleRight />
                                                : <FiToggleLeft />}
                                        </button>
                                        <button
                                            type="button"
                                            title="Remove category"
                                            onClick={() => removeCategory(category)}
                                            disabled={actionId === category._id}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
