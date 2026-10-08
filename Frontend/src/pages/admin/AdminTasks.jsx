import { useEffect, useState } from "react";
import {
    FiPlus,
    FiX,
    FiCheckCircle
} from "react-icons/fi";

import api from "../../services/api";
import useRealtimeRefresh from "../../hooks/useRealtimeRefresh";

import "./AdminTasks.css";

const AdminTasks = () => {

    const [tasks, setTasks] = useState([]);

    const [staff, setStaff] = useState([]);

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        requestId: "",
        assignedTo: "",
        dueDate: ""
    });

    const fetchData = async () => {

        try {

            setLoading(true);

            setError("");

            const [
                tasksResponse,
                staffResponse,
                requestsResponse
            ] = await Promise.all([
                api.get("/tasks"),
                api.get("/users/staff"),
                api.get("/requests")
            ]);

            setTasks(
                tasksResponse.data.tasks || []
            );

            setStaff(
                staffResponse.data.staff || []
            );

            setRequests(
                requestsResponse.data.requests || []
            );

        } catch (error) {

            console.error(
                "Failed to load task data:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load task information."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        fetchData();

    }, []);

    useRealtimeRefresh(() => fetchData(), ["task.assigned", "task.updated"]);

    const openCreateModal = () => {

        setFormData({
            title: "",
            description: "",
            requestId: "",
            assignedTo: "",
            dueDate: ""
        });

        setShowModal(true);
    };

    const closeModal = () => {

        setShowModal(false);

        setFormData({
            title: "",
            description: "",
            requestId: "",
            assignedTo: "",
            dueDate: ""
        });
    };

    const handleChange = (event) => {

        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const createTask = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);

            await api.post(
                "/tasks",
                {
                    title: formData.title,
                    description: formData.description,
                    requestId: formData.requestId,
                    assignedTo: formData.assignedTo,
                    dueDate: formData.dueDate || null
                }
            );

            alert(
                "Task created successfully."
            );

            closeModal();

            await fetchData();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to create task."
            );

        } finally {

            setSaving(false);

        }
    };

    const getStatusClass = (status) => {

        switch (status) {

            case "Pending":
                return "task-status-pending";

            case "In Progress":
                return "task-status-progress";

            case "Completed":
                return "task-status-completed";

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
            <div className="admin-task-message">
                Loading tasks...
            </div>
        );
    }

    return (
        <div className="admin-tasks-page">

            <div className="admin-tasks-header">

                <div>

                    <h2>
                        Task Management
                    </h2>

                    <p>
                        Create and assign operational tasks to staff.
                    </p>

                </div>

                <button
                    type="button"
                    className="admin-create-task-button"
                    onClick={openCreateModal}
                >
                    <FiPlus />
                    Create Task
                </button>

            </div>

            {error && (

                <div className="admin-task-error">
                    {error}
                </div>

            )}

            <div className="admin-task-card">

                <div className="admin-task-card-header">

                    <div>

                        <h3>
                            All Tasks
                        </h3>

                        <p>
                            {tasks.length} task
                            {tasks.length !== 1 ? "s" : ""}
                        </p>

                    </div>

                </div>

                {tasks.length === 0 ? (

                    <div className="admin-task-empty">

                        <FiCheckCircle />

                        <h4>
                            No tasks yet
                        </h4>

                        <p>
                            Create a task to assign work to staff.
                        </p>

                    </div>

                ) : (

                    <div className="admin-task-table-wrapper">

                        <table className="admin-task-table">

                            <thead>

                                <tr>

                                    <th>
                                        Task
                                    </th>

                                    <th>
                                        Request
                                    </th>

                                    <th>
                                        Assigned To
                                    </th>

                                    <th>
                                        Due Date
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

                                {tasks.map((task) => (

                                    <tr key={task._id}>

                                        <td>

                                            <div className="admin-task-info">

                                                <strong>
                                                    {task.title}
                                                </strong>

                                                <span>
                                                    {task.description}
                                                </span>

                                            </div>

                                        </td>

                                        <td>
                                            {task.requestId?.title ||
                                                "-"}
                                        </td>

                                        <td>

                                            {task.assignedTo?.name ||
                                                "-"}

                                        </td>

                                        <td>
                                            {formatDate(
                                                task.dueDate
                                            )}
                                        </td>

                                        <td>

                                            <span
                                                className={`admin-task-status ${getStatusClass(
                                                    task.status
                                                )}`}
                                            >
                                                {task.status}
                                            </span>

                                        </td>

                                        <td>
                                            {formatDate(
                                                task.createdAt
                                            )}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {showModal && (

                <div className="admin-task-modal-overlay">

                    <div className="admin-task-modal">

                        <div className="admin-task-modal-header">

                            <div>

                                <span>
                                    New Task
                                </span>

                                <h3>
                                    Create Operational Task
                                </h3>

                            </div>

                            <button
                                type="button"
                                className="admin-task-close"
                                onClick={closeModal}
                            >
                                <FiX />
                            </button>

                        </div>

                        <form onSubmit={createTask}>

                            <div className="admin-task-modal-body">

                                <label>
                                    Task Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter task title"
                                    required
                                />

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={handleChange}
                                    placeholder="Describe the task"
                                    required
                                />

                                <label>
                                    Related Request
                                </label>

                                <select
                                    name="requestId"
                                    value={
                                        formData.requestId
                                    }
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select request
                                    </option>

                                    {requests.map(
                                        (request) => (

                                            <option
                                                key={
                                                    request._id
                                                }
                                                value={
                                                    request._id
                                                }
                                            >
                                                {request.title}
                                            </option>

                                        )
                                    )}

                                </select>

                                <label>
                                    Assign To
                                </label>

                                <select
                                    name="assignedTo"
                                    value={
                                        formData.assignedTo
                                    }
                                    onChange={handleChange}
                                    required
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
                                                </option>

                                            )
                                        )}

                                </select>

                                <label>
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    name="dueDate"
                                    value={
                                        formData.dueDate
                                    }
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="admin-task-modal-footer">

                                <button
                                    type="button"
                                    className="admin-task-cancel"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-task-save"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create Task"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminTasks;
