import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiToggleLeft, FiToggleRight, FiTrash2 } from "react-icons/fi";

import api from "../../services/api";

import "./AdminDepartments.css";

const AdminDepartments = () => {

    const [departments, setDepartments] = useState([]);
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
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/departments");

            setDepartments(response.data.departments || []);

        } catch (error) {
            console.error("Failed to fetch departments:", error);
            setError(
                error.response?.data?.message ||
                "Failed to load departments."
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

    const openEditForm = (department) => {
        setEditingId(department._id);
        setFormData({
            name: department.name,
            description: department.description || ""
        });
        setShowForm(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            setError("Department name is required.");
            return;
        }

        try {
            if (editingId) {
                await api.put(`/departments/${editingId}`, formData);
            } else {
                await api.post("/departments", formData);
            }

            setShowForm(false);
            fetchDepartments();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to save department."
            );
        }
    };

    const toggleStatus = async (department) => {
        if (actionId) return;
        try {
            setActionId(department._id);
            await api.patch(`/departments/${department._id}/status`, {
                isActive: !department.isActive
            });

            fetchDepartments();

        } catch (error) {
            setError(error.response?.data?.message || "Failed to update department status.");
        } finally {
            setActionId(null);
        }
    };

    const removeDepartment = async (department) => {
        if (actionId) return;
        const confirmed = window.confirm(
            `Remove department “${department.name}”? This permanently deletes it only when no users or historical requests reference it. Referenced departments are protected and must be deactivated instead.`
        );
        if (!confirmed) return;

        try {
            setActionId(department._id);
            setError("");
            await api.delete(`/departments/${department._id}`);
            setDepartments((previous) => previous.filter((item) => item._id !== department._id));
        } catch (error) {
            setError(error.response?.data?.message || "Failed to remove department.");
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="admin-departments">

            <div className="admin-departments-header">
                <div>
                    <h2>Departments</h2>
                    <p>Manage the departments requests can be routed to.</p>
                </div>

                <button
                    type="button"
                    className="admin-departments-add-btn"
                    onClick={openCreateForm}
                >
                    <FiPlus />
                    Add department
                </button>
            </div>

            {error && (
                <div className="admin-departments-error">{error}</div>
            )}

            {showForm && (
                <div className="admin-departments-form-overlay">
                    <form
                        className="admin-departments-form"
                        onSubmit={handleSubmit}
                    >
                        <h3>
                            {editingId ? "Edit department" : "New department"}
                        </h3>

                        <label htmlFor="department-name">Name</label>
                        <input
                            type="text"
                            id="department-name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. IT Support"
                        />

                        <label htmlFor="department-description">Description</label>
                        <textarea
                            id="department-description"
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Optional description"
                        />

                        <div className="admin-departments-form-actions">
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
                <div className="admin-departments-message">Loading...</div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-departments-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((department) => (
                                <tr key={department._id}>
                                    <td><strong>{department.name}</strong></td>
                                    <td>{department.description || "-"}</td>
                                    <td>
                                        <span
                                            className={
                                                department.isActive
                                                    ? "status-active"
                                                    : "status-inactive"
                                            }
                                        >
                                            {department.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="admin-departments-actions">
                                        <button
                                            type="button"
                                            onClick={() => openEditForm(department)}
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleStatus(department)}
                                            disabled={actionId === department._id}
                                        >
                                            {department.isActive
                                                ? <FiToggleRight />
                                                : <FiToggleLeft />}
                                        </button>
                                        <button
                                            type="button"
                                            title="Remove department"
                                            onClick={() => removeDepartment(department)}
                                            disabled={actionId === department._id}
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

export default AdminDepartments;
