import { useEffect, useState } from "react";
import {
    FiSearch,
    FiUserPlus,
    FiX,
    FiCheckCircle,
    FiFileText
} from "react-icons/fi";

import api from "../../services/api";

import "./AdminRequests.css";

const AdminRequests = () => {

    const [requests, setRequests] = useState([]);

    const [staff, setStaff] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [priorityFilter, setPriorityFilter] =
        useState("All");

    const [selectedRequest, setSelectedRequest] =
        useState(null);

    const [selectedStaff, setSelectedStaff] =
        useState("");

    const [assigning, setAssigning] =
        useState(false);

    const fetchRequests = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await api.get(
                "/requests"
            );

            setRequests(
                response.data.requests || []
            );

        } catch (error) {

            console.error(
                "Failed to fetch requests:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load requests."
            );

        } finally {

            setLoading(false);

        }
    };

    const fetchStaff = async () => {

        try {

            const response = await api.get(
                "/users/staff"
            );

            setStaff(
                response.data.staff || []
            );

        } catch (error) {

            console.error(
                "Failed to fetch staff:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load staff."
            );

        }
    };

    useEffect(() => {

        fetchRequests();
        fetchStaff();

    }, []);

    const openAssignModal = (request) => {

        setSelectedRequest(request);

        setSelectedStaff(
            request.assignedTo?._id || ""
        );
    };

    const closeAssignModal = () => {

        setSelectedRequest(null);

        setSelectedStaff("");
    };

    const assignRequest = async () => {

        if (!selectedStaff) {

            alert(
                "Please select a staff member."
            );

            return;
        }

        try {

            setAssigning(true);

            await api.patch(
                `/requests/${selectedRequest._id}/assign`,
                {
                    staffId: selectedStaff
                }
            );

            closeAssignModal();

            await fetchRequests();

            alert(
                "Request assigned successfully."
            );

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to assign request."
            );

        } finally {

            setAssigning(false);

        }
    };

    const filteredRequests = requests.filter(
        (request) => {

            const searchValue =
                search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                request.title
                    ?.toLowerCase()
                    .includes(searchValue) ||
                request.description
                    ?.toLowerCase()
                    .includes(searchValue) ||
                request.category
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "All" ||
                request.status === statusFilter;

            const matchesPriority =
                priorityFilter === "All" ||
                request.priority === priorityFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );
        }
    );

    const getStatusClass = (status) => {

        switch (status) {

            case "Pending":
                return "admin-request-status-pending";

            case "Assigned":
                return "admin-request-status-assigned";

            case "In Progress":
                return "admin-request-status-progress";

            case "Resolved":
                return "admin-request-status-resolved";

            case "Closed":
                return "admin-request-status-closed";

            default:
                return "";
        }
    };

    const getPriorityClass = (priority) => {

        switch (priority) {

            case "Low":
                return "admin-request-priority-low";

            case "Medium":
                return "admin-request-priority-medium";

            case "High":
                return "admin-request-priority-high";

            case "Critical":
                return "admin-request-priority-critical";

            default:
                return "";
        }
    };

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    if (loading) {

        return (
            <div className="admin-requests-message">
                Loading requests...
            </div>
        );

    }

    return (
        <div className="admin-requests-page">

            <div className="admin-requests-header">

                <div>

                    <h2>
                        All Requests
                    </h2>

                    <p>
                        View, filter and assign service requests.
                    </p>

                </div>

                <div className="admin-request-count">

                    {filteredRequests.length} requests

                </div>

            </div>

            {error && (

                <div className="admin-requests-error">
                    {error}
                </div>

            )}

            <div className="admin-request-filters">

                <div className="admin-search-box">

                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >
                    <option value="All">
                        All Status
                    </option>

                    <option value="Pending">
                        Pending
                    </option>

                    <option value="Assigned">
                        Assigned
                    </option>

                    <option value="In Progress">
                        In Progress
                    </option>

                    <option value="Resolved">
                        Resolved
                    </option>

                    <option value="Closed">
                        Closed
                    </option>

                </select>

                <select
                    value={priorityFilter}
                    onChange={(event) =>
                        setPriorityFilter(
                            event.target.value
                        )
                    }
                >
                    <option value="All">
                        All Priority
                    </option>

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

            {!error && filteredRequests.length === 0 ? (

                <div className="admin-no-requests">

                    <FiFileText />

                    <h3>
                        No requests found
                    </h3>

                    <p>
                        Try changing your search or filters.
                    </p>

                </div>

            ) : (

                <div className="admin-request-table-card">

                    <div className="admin-table-title">

                        <div>

                            <h3>
                                Service Requests
                            </h3>

                            <p>
                                All requests submitted in SmartOps
                            </p>

                        </div>

                    </div>

                    <div className="admin-request-table-wrapper">

                        <table className="admin-request-table">

                            <thead>

                                <tr>

                                    <th>
                                        Request
                                    </th>

                                    <th>
                                        Created By
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Priority
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Assigned To
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredRequests.map(
                                    (request) => (

                                        <tr
                                            key={request._id}
                                        >

                                            <td>

                                                <div className="admin-request-info">

                                                    <strong>
                                                        {
                                                            request.title
                                                        }
                                                    </strong>

                                                    <span>
                                                        #
                                                        {request._id.slice(
                                                            -6
                                                        )}
                                                    </span>

                                                </div>

                                            </td>

                                            <td>

                                                <div className="admin-user-info">

                                                    <strong>
                                                        {
                                                            request.createdBy
                                                                ?.name ||
                                                            "-"
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            request.createdBy
                                                                ?.email ||
                                                            "-"
                                                        }
                                                    </span>

                                                </div>

                                            </td>

                                            <td>
                                                {
                                                    request.category
                                                }
                                            </td>

                                            <td>

                                                <span
                                                    className={`admin-request-priority ${getPriorityClass(
                                                        request.priority
                                                    )}`}
                                                >
                                                    {
                                                        request.priority
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`admin-request-status ${getStatusClass(
                                                        request.status
                                                    )}`}
                                                >
                                                    {
                                                        request.status
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                {request.assignedTo
                                                    ?.name || (
                                                    <span className="not-assigned">
                                                        Not assigned
                                                    </span>
                                                )}

                                            </td>

                                            <td>

                                                {request.status !==
                                                    "Closed" && (

                                                    <button
                                                        type="button"
                                                        className="admin-assign-button"
                                                        onClick={() =>
                                                            openAssignModal(
                                                                request
                                                            )
                                                        }
                                                    >

                                                        <FiUserPlus />

                                                        {request.assignedTo
                                                            ? "Reassign"
                                                            : "Assign"}

                                                    </button>

                                                )}

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

            {selectedRequest && (

                <div className="admin-modal-overlay">

                    <div className="admin-assign-modal">

                        <div className="admin-modal-header">

                            <div>

                                <span>
                                    Assign Request
                                </span>

                                <h3>
                                    {selectedRequest.title}
                                </h3>

                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={
                                    closeAssignModal
                                }
                            >
                                <FiX />
                            </button>

                        </div>

                        <div className="admin-modal-body">

                            <div className="admin-selected-request">

                                <span>
                                    Request ID
                                </span>

                                <strong>
                                    #
                                    {selectedRequest._id.slice(
                                        -6
                                    )}
                                </strong>

                            </div>

                            <label>
                                Select Staff Member
                            </label>

                            <select
                                value={selectedStaff}
                                onChange={(event) =>
                                    setSelectedStaff(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select staff member
                                </option>

                                {staff
                                    .filter(
                                        (member) =>
                                            member.isActive
                                    )
                                    .map(
                                        (member) => (

                                            <option
                                                key={
                                                    member._id
                                                }
                                                value={
                                                    member._id
                                                }
                                            >
                                                {member.name}
                                                {" - "}
                                                {member.email}
                                            </option>

                                        )
                                    )}

                            </select>

                            <p>
                                Only active staff members are
                                available for assignment.
                            </p>

                        </div>

                        <div className="admin-modal-footer">

                            <button
                                type="button"
                                className="admin-cancel-button"
                                onClick={
                                    closeAssignModal
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="admin-confirm-button"
                                disabled={
                                    assigning ||
                                    !selectedStaff
                                }
                                onClick={
                                    assignRequest
                                }
                            >

                                <FiCheckCircle />

                                {assigning
                                    ? "Assigning..."
                                    : "Assign Request"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminRequests;