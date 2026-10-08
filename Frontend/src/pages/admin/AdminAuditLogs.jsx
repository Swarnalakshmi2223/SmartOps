import { useEffect, useState } from "react";
import { FiActivity, FiSearch } from "react-icons/fi";

import api from "../../services/api";

import "./AdminAuditLogs.css";

const AdminAuditLogs = () => {

    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [moduleFilter, setModuleFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/audit-logs");

            setLogs(response.data.logs || []);

        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
            setError(
                error.response?.data?.message ||
                "Failed to load audit logs."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const moduleOptions = [
        "All",
        ...new Set(logs.map((log) => log.module))
    ];

    const filteredLogs = logs.filter((log) => {
        const matchesModule =
            moduleFilter === "All" || log.module === moduleFilter;

        const matchesSearch =
            log.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (log.user?.name || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        return matchesModule && matchesSearch;
    });

    return (
        <div className="admin-audit-page">

            <div className="admin-audit-header">
                <div>
                    <h2>Audit Logs</h2>
                    <p>Track administrative actions and important system events.</p>
                </div>
            </div>

            <div className="admin-audit-filters">
                <div className="admin-audit-search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search by user or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                >
                    {moduleOptions.map((moduleName) => (
                        <option key={moduleName} value={moduleName}>
                            {moduleName}
                        </option>
                    ))}
                </select>
            </div>

            {loading && (
                <div className="admin-audit-message">Loading audit logs...</div>
            )}

            {error && !loading && (
                <div className="admin-audit-error">{error}</div>
            )}

            {!loading && !error && (
                filteredLogs.length === 0 ? (
                    <div className="admin-audit-empty">
                        <FiActivity />
                        <h4>No audit logs found</h4>
                        <p>Try adjusting your search or filter.</p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-audit-table">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>Module</th>
                                    <th>Description</th>
                                    <th>By</th>
                                    <th>Related request</th>
                                    <th>When</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr key={log._id}>
                                        <td>
                                            <span className="admin-audit-action-badge">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td>{log.module}</td>
                                        <td className="admin-audit-description">
                                            {log.description}
                                        </td>
                                        <td>
                                            {log.user
                                                ? `${log.user.name} (${log.user.role})`
                                                : "System"}
                                        </td>
                                        <td>
                                            {log.request
                                                ? log.request.title
                                                : "-"}
                                        </td>
                                        <td>{formatDate(log.createdAt)}</td>
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

export default AdminAuditLogs;