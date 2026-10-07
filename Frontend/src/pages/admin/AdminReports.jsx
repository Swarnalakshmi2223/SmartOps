import { useEffect, useState } from "react";
import { FiFileText, FiFilter } from "react-icons/fi";

import api from "../../services/api";

import "./AdminReports.css";

const AdminReports = () => {

    const [activeTab, setActiveTab] = useState("overview");

    const [requestReport, setRequestReport] = useState(null);
    const [categoryReport, setCategoryReport] = useState([]);
    const [staffWorkload, setStaffWorkload] = useState([]);

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [dateReport, setDateReport] = useState(null);
    const [dateError, setDateError] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");

            const [requestRes, categoryRes, staffRes] = await Promise.all([
                api.get("/reports/requests"),
                api.get("/reports/categories"),
                api.get("/reports/staff-workload")
            ]);

            setRequestReport(requestRes.data.report);
            setCategoryReport(categoryRes.data.categories || []);
            setStaffWorkload(staffRes.data.staffWorkload || []);

        } catch (error) {
            console.error("Failed to fetch reports:", error);
            setError(
                error.response?.data?.message ||
                "Failed to load reports."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDateReport = async (event) => {
        event.preventDefault();
        setDateError("");

        if (!dateFrom || !dateTo) {
            setDateError("Please select both dates.");
            return;
        }

        try {
            const response = await api.get("/reports/requests/date", {
                params: { from: dateFrom, to: dateTo }
            });

            setDateReport(response.data.report);

        } catch (error) {
            setDateError(
                error.response?.data?.message ||
                "Failed to generate date report."
            );
        }
    };

    const tabs = [
        { key: "overview", label: "Overview" },
        { key: "categories", label: "By category" },
        { key: "staff", label: "Staff workload" },
        { key: "daterange", label: "Date range" }
    ];

    return (
        <div className="admin-reports">

            <div className="admin-reports-header">
                <h2>Reports</h2>
                <p>Request, category, staff and date-based reporting.</p>
            </div>

            <div className="admin-reports-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        className={
                            activeTab === tab.key
                                ? "admin-reports-tab active"
                                : "admin-reports-tab"
                        }
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="admin-reports-message">Loading reports...</div>
            )}

            {error && !loading && (
                <div className="admin-reports-error">{error}</div>
            )}

            {!loading && !error && activeTab === "overview" && requestReport && (
                <div className="admin-reports-grid">

                    <div className="admin-reports-card">
                        <h3>Total requests</h3>
                        <strong className="admin-reports-big-number">
                            {requestReport.totalRequests}
                        </strong>
                    </div>

                    <div className="admin-reports-card">
                        <h3>By status</h3>
                        <ul className="admin-reports-list">
                            <li><span>Pending</span><strong>{requestReport.statusSummary.pending}</strong></li>
                            <li><span>Assigned</span><strong>{requestReport.statusSummary.assigned}</strong></li>
                            <li><span>In Progress</span><strong>{requestReport.statusSummary.inProgress}</strong></li>
                            <li><span>Resolved</span><strong>{requestReport.statusSummary.resolved}</strong></li>
                            <li><span>Closed</span><strong>{requestReport.statusSummary.closed}</strong></li>
                        </ul>
                    </div>

                    <div className="admin-reports-card">
                        <h3>By priority</h3>
                        <ul className="admin-reports-list">
                            <li><span>Low</span><strong>{requestReport.prioritySummary.low}</strong></li>
                            <li><span>Medium</span><strong>{requestReport.prioritySummary.medium}</strong></li>
                            <li><span>High</span><strong>{requestReport.prioritySummary.high}</strong></li>
                            <li><span>Critical</span><strong>{requestReport.prioritySummary.critical}</strong></li>
                        </ul>
                    </div>

                </div>
            )}

            {!loading && !error && activeTab === "categories" && (
                <div className="admin-table-wrapper">
                    <table className="admin-reports-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Requests</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoryReport.length === 0 ? (
                                <tr><td colSpan="2">No data yet.</td></tr>
                            ) : (
                                categoryReport.map((row) => (
                                    <tr key={row._id || "uncategorized"}>
                                        <td>{row._id || "Uncategorized"}</td>
                                        <td>{row.count}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !error && activeTab === "staff" && (
                <div className="admin-table-wrapper">
                    <table className="admin-reports-table">
                        <thead>
                            <tr>
                                <th>Staff</th>
                                <th>Email</th>
                                <th>Assigned requests</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffWorkload.length === 0 ? (
                                <tr><td colSpan="3">No assigned requests yet.</td></tr>
                            ) : (
                                staffWorkload.map((row) => (
                                    <tr key={row.staffId}>
                                        <td>{row.staffName}</td>
                                        <td>{row.staffEmail}</td>
                                        <td>{row.requestCount}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === "daterange" && (
                <div className="admin-reports-daterange">

                    <form
                        className="admin-reports-date-form"
                        onSubmit={handleDateReport}
                    >
                        <div>
                            <label>From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        <div>
                            <label>To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>

                        <button type="submit">
                            <FiFilter />
                            Generate
                        </button>
                    </form>

                    {dateError && (
                        <div className="admin-reports-error">{dateError}</div>
                    )}

                    {dateReport && (
                        <div className="admin-reports-grid">

                            <div className="admin-reports-card">
                                <h3>Total requests</h3>
                                <strong className="admin-reports-big-number">
                                    {dateReport.totalRequests}
                                </strong>
                            </div>

                            <div className="admin-reports-card">
                                <h3>By status</h3>
                                <ul className="admin-reports-list">
                                    <li><span>Pending</span><strong>{dateReport.statusSummary.pending}</strong></li>
                                    <li><span>Assigned</span><strong>{dateReport.statusSummary.assigned}</strong></li>
                                    <li><span>In Progress</span><strong>{dateReport.statusSummary.inProgress}</strong></li>
                                    <li><span>Resolved</span><strong>{dateReport.statusSummary.resolved}</strong></li>
                                    <li><span>Closed</span><strong>{dateReport.statusSummary.closed}</strong></li>
                                </ul>
                            </div>

                            <div className="admin-reports-card">
                                <h3>By priority</h3>
                                <ul className="admin-reports-list">
                                    <li><span>Low</span><strong>{dateReport.prioritySummary.low}</strong></li>
                                    <li><span>Medium</span><strong>{dateReport.prioritySummary.medium}</strong></li>
                                    <li><span>High</span><strong>{dateReport.prioritySummary.high}</strong></li>
                                    <li><span>Critical</span><strong>{dateReport.prioritySummary.critical}</strong></li>
                                </ul>
                            </div>

                        </div>
                    )}

                    {!dateReport && !dateError && (
                        <div className="admin-reports-message">
                            <FiFileText />
                            Pick a date range and click Generate.
                        </div>
                    )}

                </div>
            )}

        </div>
    );
};

export default AdminReports;