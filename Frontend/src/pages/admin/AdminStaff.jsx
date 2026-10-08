import { useEffect, useState } from "react";
import {
    FiPlus,
    FiEdit2,
    FiUserCheck,
    FiUserX,
    FiX
} from "react-icons/fi";

import api from "../../services/api";

import "./AdminStaff.css";

const AdminStaff = () => {

    const [staff, setStaff] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [editingStaff, setEditingStaff] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        department: "",
        password: "",
        confirmPassword: ""
    });

    const [saving, setSaving] = useState(false);

    const fetchStaff = async () => {

        try {

            setLoading(true);
            setError("");

            const [response, departmentResponse] = await Promise.all([
                api.get("/users/staff"),
                api.get("/departments")
            ]);

            setStaff(
                response.data.staff || []
            );
            setDepartments(
                (departmentResponse.data.departments || [])
                    .filter((department) => department.isActive !== false)
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to load staff."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        fetchStaff();

    }, []);

    const openAddModal = () => {

        setEditingStaff(null);

        setFormData({
            name: "",
            email: "",
            phone: "",
            department: "",
            password: "",
            confirmPassword: ""
        });

        setShowModal(true);
    };

    const openEditModal = (member) => {

        setEditingStaff(member);

        setFormData({
            name: member.name,
            email: member.email,
            phone: member.phone || "",
            department: member.department || "",
            password: "",
            confirmPassword: ""
        });

        setShowModal(true);
    };

    const closeModal = () => {

        setShowModal(false);

        setEditingStaff(null);

        setFormData({
            name: "",
            email: "",
            phone: "",
            department: "",
            password: "",
            confirmPassword: ""
        });
    };

    const handleChange = (event) => {

        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);

            if (editingStaff) {

                await api.put(
                    `/users/staff/${editingStaff._id}`,
                    {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        department: formData.department
                    }
                );

                alert(
                    "Staff updated successfully."
                );

            } else {

                await api.post(
                    "/users/staff",
                    {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        department: formData.department,
                        password: formData.password,
                        confirmPassword: formData.confirmPassword
                    }
                );

                alert(
                    "Staff created successfully."
                );
            }

            closeModal();

            await fetchStaff();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Operation failed."
            );

        } finally {

            setSaving(false);

        }
    };

    const toggleStaffStatus = async (member) => {

        const newStatus = !member.isActive;

        try {

            await api.patch(
                `/users/staff/${member._id}/status`,
                {
                    isActive: newStatus
                }
            );

            await fetchStaff();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to update staff status."
            );
        }
    };

    if (loading) {

        return (
            <div className="admin-staff-message">
                Loading staff...
            </div>
        );
    }

    return (
        <div className="admin-staff-page">

            <div className="admin-staff-header">

                <div>

                    <h2>
                        Staff Management
                    </h2>

                    <p>
                        Manage support staff and their account status.
                    </p>

                </div>

                <button
                    type="button"
                    className="admin-add-staff-button"
                    onClick={openAddModal}
                >
                    <FiPlus />
                    Add Staff
                </button>

            </div>

            {error && (
                <div className="admin-staff-error">
                    {error}
                </div>
            )}

            <div className="admin-staff-card">

                <div className="admin-staff-card-header">

                    <div>

                        <h3>
                            Support Staff
                        </h3>

                        <p>
                            {staff.length} staff member
                            {staff.length !== 1 ? "s" : ""}
                        </p>

                    </div>

                </div>

                <div className="admin-staff-table-wrapper">

                    <table className="admin-staff-table">

                        <thead>

                            <tr>

                                <th>
                                    Staff
                                </th>

                                <th>
                                    Email
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Joined
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {staff.map((member) => (

                                <tr key={member._id}>

                                    <td>

                                        <div className="admin-staff-user">

                                            <div className="admin-staff-avatar">
                                                {member.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>

                                                <strong>
                                                    {member.name}
                                                </strong>

                                                <span>
                                                    Staff
                                                </span>

                                            </div>

                                        </div>

                                    </td>

                                    <td>
                                        {member.email}
                                    </td>

                                    <td>

                                        <span
                                            className={
                                                member.isActive
                                                    ? "staff-active"
                                                    : "staff-inactive"
                                            }
                                        >
                                            {member.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>

                                    </td>

                                    <td>

                                        {new Date(
                                            member.createdAt
                                        ).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            }
                                        )}

                                    </td>

                                    <td>

                                        <div className="admin-staff-actions">

                                            <button
                                                type="button"
                                                className="staff-edit-button"
                                                onClick={() =>
                                                    openEditModal(
                                                        member
                                                    )
                                                }
                                                title="Edit staff"
                                            >
                                                <FiEdit2 />
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    member.isActive
                                                        ? "staff-deactivate-button"
                                                        : "staff-activate-button"
                                                }
                                                onClick={() =>
                                                    toggleStaffStatus(
                                                        member
                                                    )
                                                }
                                                title={
                                                    member.isActive
                                                        ? "Deactivate"
                                                        : "Activate"
                                                }
                                            >

                                                {member.isActive
                                                    ? <FiUserX />
                                                    : <FiUserCheck />}

                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

            {showModal && (

                <div className="admin-staff-modal-overlay">

                    <div className="admin-staff-modal">

                        <div className="admin-staff-modal-header">

                            <div>

                                <span>
                                    {editingStaff
                                        ? "Edit Staff"
                                        : "New Staff"}
                                </span>

                                <h3>
                                    {editingStaff
                                        ? "Update Staff Member"
                                        : "Create Staff Member"}
                                </h3>

                            </div>

                            <button
                                type="button"
                                className="admin-staff-close"
                                onClick={closeModal}
                            >
                                <FiX />
                            </button>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="admin-staff-modal-body">

                                <label>
                                    Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter staff name"
                                    required
                                />

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                    required
                                />

                                <label>
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                />

                                <label>
                                    Department
                                </label>

                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required={!editingStaff}
                                >
                                    <option value="">Select department</option>
                                    {formData.department &&
                                        !departments.some(
                                            (department) => department.name === formData.department
                                        ) && (
                                            <option value={formData.department}>
                                                {formData.department} (current)
                                            </option>
                                        )}
                                    {departments.map((department) => (
                                        <option key={department._id} value={department.name}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>

                                {!editingStaff && (

                                    <>
                                        <label>
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            value={
                                                formData.password
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter password"
                                            required
                                            minLength={6}
                                        />

                                        <label>
                                            Confirm Password
                                        </label>

                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm password"
                                            required
                                            minLength={6}
                                        />
                                    </>

                                )}

                            </div>

                            <div className="admin-staff-modal-footer">

                                <button
                                    type="button"
                                    className="admin-staff-cancel"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-staff-save"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingStaff
                                            ? "Update Staff"
                                            : "Create Staff"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminStaff;
