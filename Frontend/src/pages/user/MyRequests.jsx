import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiPlus,
    FiSearch,
    FiFileText
} from "react-icons/fi";


import api from "../../services/api";
import useRealtimeRefresh from "../../hooks/useRealtimeRefresh";

import "./MyRequests.css";

const MyRequests = () => {

    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");

    const [priorityFilter, setPriorityFilter] = useState("All");


    const fetchRequests = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await api.get("/requests/my");

            setRequests(response.data.requests || []);

        } catch (error) {

            console.error("Failed to fetch requests:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load requests"
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        fetchRequests();

    }, []);

    useRealtimeRefresh(() => fetchRequests(), [
        "request.created",
        "request.assigned",
        "request.statusChanged",
        "request.started",
        "request.resolved",
        "request.closed"
    ]);

    const filteredRequests = requests.filter((request) => {

        const matchesSearch =
            request.title
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            request.description
                ?.toLowerCase()
                .includes(search.toLowerCase());

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
    });

    const getStatusClass = (status) => {

        switch (status) {

            case "Pending":
                return "status-pending";

            case "Assigned":
                return "status-assigned";

            case "In Progress":
                return "status-progress";

            case "Resolved":
                return "status-resolved";

            case "Closed":
                return "status-closed";

            default:
                return "";
        }
    };

    const getPriorityClass = (priority) => {

        switch (priority) {

            case "Low":
                return "priority-low";

            case "Medium":
                return "priority-medium";

            case "High":
                return "priority-high";

            case "Critical":
                return "priority-critical";

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

    return (
        <div className="my-requests-page">

            <div className="requests-page-header">

                <div>
                    <h2>
                        My Requests
                    </h2>

                    <p>
                        View and manage your service requests.
                    </p>
                </div>

                <button
                       className="create-request-button"
                       onClick={() =>
                           navigate("/user/requests/new")
                       }
                   >
                       <FiPlus />
                   
                       New Request
                   </button>

            </div>

            <div className="request-toolbar">

                <div className="request-search">

                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                </div>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
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
                        setPriorityFilter(event.target.value)
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

            {loading && (
                <div className="requests-message">
                    Loading requests...
                </div>
            )}

            {error && !loading && (
                <div className="requests-error">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="requests-card">

                    <div className="requests-card-header">

                        <div>
                            <h3>
                                Service Requests
                            </h3>

                            <span>
                                {filteredRequests.length} request
                                {filteredRequests.length !== 1
                                    ? "s"
                                    : ""}
                            </span>
                        </div>

                    </div>

                    {filteredRequests.length === 0 ? (

                        <div className="requests-empty">

                            <FiFileText />

                            <h4>
                                No requests found
                            </h4>

                            <p>
                                Try changing your filters or create
                                a new request.
                            </p>

                        </div>

                    ) : (

                        <div className="requests-table-wrapper">

                            <table className="my-requests-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Request
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
                                            Created
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

                                                    <div className="request-info">

                                                        <strong
                                                               className="request-clickable"
                                                               onClick={() =>
                                                                   navigate(`/user/requests/${request._id}`)
                                                               }
                                                           >
                                                               {request.title}
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
                                                    {request.category}
                                                </td>

                                                <td>

                                                    <span
                                                        className={`priority-badge ${getPriorityClass(
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
                                                        className={`status-badge ${getStatusClass(
                                                            request.status
                                                        )}`}
                                                    >
                                                        {
                                                            request.status
                                                        }
                                                    </span>

                                                </td>

                                                <td>
                                                    {formatDate(
                                                        request.createdAt
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>
            )}


        </div>
    );
};

export default MyRequests;
