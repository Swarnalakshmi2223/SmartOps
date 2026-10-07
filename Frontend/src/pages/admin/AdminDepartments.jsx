import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiToggleLeft, FiToggleRight } from "react-icons/fi";

import api from "../../services/api";

import "./AdminDepartments.css";

const AdminDepartments = () => {

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
        try {
            await api.patch(`/departments/${department._id}/status`, {
                isActive: !department.isActive
            });

            fetchDepartments();

        } catch (error) {
            console.error("Failed to update status:", error);
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

                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. IT Support"
                        />

                        <label>Description</label>
                        <textarea
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
                                        >
                                            {department.isActive
                                                ? <FiToggleRight />
                                                : <FiToggleLeft />}
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