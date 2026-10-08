import { useEffect, useState } from "react";
import {
    FiPlay,
    FiCheckCircle,
    FiClock,
    FiFileText
} from "react-icons/fi";

import api from "../../services/api";
import useRealtimeRefresh from "../../hooks/useRealtimeRefresh";

import "./StaffTasks.css";

const StaffTasks = () => {

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");

    const fetchTasks = async () => {
        try {
            setLoading(true);

            const response = await api.get("/tasks/my");

            setTasks(response.data.tasks || []);

        } catch (error) {
            console.error("Failed to load tasks:", error);

            alert(
                error.response?.data?.message ||
                "Failed to load your tasks."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useRealtimeRefresh(() => fetchTasks(), ["task.assigned", "task.updated"]);

    const startTask = async (taskId) => {
        try {
            setActionLoading(taskId);

            await api.patch(
                `/tasks/${taskId}/start`
            );

            alert("Task started successfully.");

            await fetchTasks();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to start task."
            );
        } finally {
            setActionLoading("");
        }
    };

    const completeTask = async (taskId) => {

        const confirmed = window.confirm(
            "Are you sure you want to complete this task?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(taskId);

            await api.patch(
                `/tasks/${taskId}/complete`
            );

            alert("Task completed successfully.");

            await fetchTasks();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to complete task."
            );
        } finally {
            setActionLoading("");
        }
    };

    const getStatusClass = (status) => {

        switch (status) {

            case "Pending":
                return "staff-task-status-pending";

            case "In Progress":
                return "staff-task-status-progress";

            case "Completed":
                return "staff-task-status-completed";

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
            <div className="staff-task-message">
                Loading your tasks...
            </div>
        );
    }

    return (
        <div className="staff-tasks-page">

            <div className="staff-tasks-header">

                <div>
                    <h2>My Tasks</h2>

                    <p>
                        View and manage tasks assigned to you.
                    </p>
                </div>

                <div className="staff-task-count">
                    <FiFileText />
                    <span>
                        {tasks.length} task
                        {tasks.length !== 1 ? "s" : ""}
                    </span>
                </div>

            </div>

            {tasks.length === 0 ? (

                <div className="staff-task-empty">

                    <FiCheckCircle />

                    <h3>No tasks assigned</h3>

                    <p>
                        You currently have no tasks assigned to you.
                    </p>

                </div>

            ) : (

                <div className="staff-task-grid">

                    {tasks.map((task) => (

                        <div
                            className="staff-task-card"
                            key={task._id}
                        >

                            <div className="staff-task-card-top">

                                <div className="staff-task-icon">
                                    <FiFileText />
                                </div>

                                <span
                                    className={`staff-task-status ${getStatusClass(task.status)}`}
                                >
                                    {task.status}
                                </span>

                            </div>

                            <div className="staff-task-content">

                                <h3>
                                    {task.title}
                                </h3>

                                <p>
                                    {task.description}
                                </p>

                            </div>

                            <div className="staff-task-details">

                                <div>
                                    <span>Related Request</span>

                                    <strong>
                                        {task.requestId?.title || "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Due Date</span>

                                    <strong>
                                        {formatDate(task.dueDate)}
                                    </strong>
                                </div>

                            </div>

                            <div className="staff-task-footer">

                                {task.status === "Pending" && (

                                    <button
                                        type="button"
                                        className="staff-start-button"
                                        disabled={
                                            actionLoading === task._id
                                        }
                                        onClick={() =>
                                            startTask(task._id)
                                        }
                                    >
                                        <FiPlay />

                                        {actionLoading === task._id
                                            ? "Starting..."
                                            : "Start Task"}
                                    </button>

                                )}

                                {task.status === "In Progress" && (

                                    <button
                                        type="button"
                                        className="staff-complete-button"
                                        disabled={
                                            actionLoading === task._id
                                        }
                                        onClick={() =>
                                            completeTask(task._id)
                                        }
                                    >
                                        <FiCheckCircle />

                                        {actionLoading === task._id
                                            ? "Completing..."
                                            : "Complete Task"}
                                    </button>

                                )}

                                {task.status === "Completed" && (

                                    <div className="staff-task-completed">
                                        <FiCheckCircle />
                                        Task Completed
                                    </div>

                                )}

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
};

export default StaffTasks;
