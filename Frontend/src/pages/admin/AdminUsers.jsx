import { useEffect, useState } from "react";
import { FiUserCheck, FiUserX } from "react-icons/fi";

import api from "../../services/api";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState("");
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/users");
            setUsers((response.data.users || []).filter((account) => account.role === "user"));
            setError("");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to load user accounts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const toggleStatus = async (account) => {
        if (actionId) return;
        const nextStatus = account.isActive === false;
        if (!nextStatus && !window.confirm(
            `Deactivate ${account.name}? This preserves requests, comments, tasks, feedback, notifications, and audit history. The currently logged-in administrator and the last active administrator cannot be deactivated.`
        )) return;

        try {
            setActionId(account._id);
            const response = await api.patch(`/users/${account._id}/status`, { isActive: nextStatus });
            setUsers((previous) => previous
                .map((item) => item._id === account._id ? { ...item, ...response.data.user } : item)
                .filter((item) => item.role === "user"));
            setError("");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to update account status.");
        } finally {
            setActionId(null);
        }
    };

    if (loading) return <div className="admin-staff-message">Loading user accounts...</div>;

    return (
        <div className="admin-staff-page">
            <div className="admin-staff-header">
                <div>
                    <h2>User Accounts</h2>
                    <p>Deactivate accounts safely without removing historical records.</p>
                </div>
            </div>
            {error && <div className="admin-staff-error">{error}</div>}
            <div className="admin-staff-card">
                <div className="admin-staff-table-wrapper">
                    <table className="admin-staff-table">
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.filter((account) => account.role === "user").map((account) => {
                                const isCurrent = account._id === currentUser?.id || account._id === currentUser?._id;
                                return (
                                    <tr key={account._id}>
                                        <td><strong>{account.name}</strong></td>
                                        <td>{account.email}</td>
                                        <td>{account.role}</td>
                                        <td><span className={account.isActive === false ? "staff-inactive" : "staff-active"}>{account.isActive === false ? "Inactive" : "Active"}</span></td>
                                        <td>
                                            <button
                                                type="button"
                                                className={account.isActive === false ? "staff-activate-button" : "staff-deactivate-button"}
                                                disabled={isCurrent || actionId === account._id}
                                                title={isCurrent ? "You cannot deactivate your own account" : account.isActive === false ? "Activate account" : "Deactivate account"}
                                                onClick={() => toggleStatus(account)}
                                            >
                                                {account.isActive === false ? <FiUserCheck /> : <FiUserX />}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
