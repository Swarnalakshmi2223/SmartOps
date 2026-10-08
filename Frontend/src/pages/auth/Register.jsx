import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiBriefcase,
    FiEye,
    FiEyeOff,
    FiLock,
    FiMail,
    FiPhone,
    FiUser,
    FiUserPlus
} from "react-icons/fi";

import api from "../../services/api";

import "./Register.css";

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const validPhone = /^[+()\-\s\d]{7,20}$/;

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        department: "",
        password: "",
        confirmPassword: ""
    });
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const response = await api.get("/departments/active");
                setDepartments(response.data.departments || []);
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                    "Unable to load departments. Please try again."
                );
            } finally {
                setLoadingDepartments(false);
            }
        };

        loadDepartments();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();
        const phone = formData.phone.trim();

        if (name.length < 2) {
            setError("Please enter your full name.");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (phone && !validPhone.test(phone)) {
            setError("Please enter a valid phone number.");
            return;
        }

        if (!formData.department) {
            setError("Please select a department.");
            return;
        }

        if (!strongPassword.test(formData.password)) {
            setError(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            );
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/auth/register", {
                name,
                email,
                phone,
                department: formData.department,
                password: formData.password
            });

            setSuccess("Registration successful. Redirecting to login...");
            window.setTimeout(() => navigate("/login"), 900);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-brand-section">
                    <div className="register-brand-logo">S</div>
                    <h1>SmartOps</h1>
                    <p>Smart Operations &amp; Service Request Management</p>
                    <div className="register-brand-description">
                        <h2>Start working smarter.</h2>
                        <p>
                            Create your employee account to submit and track
                            service requests in one centralized platform.
                        </p>
                    </div>
                </div>

                <div className="register-form-section">
                    <div className="register-header">
                        <h2>Create your account</h2>
                        <p>Register as a SmartOps employee</p>
                    </div>

                    {error && <div className="register-error">{error}</div>}
                    {success && <div className="register-success">{success}</div>}

                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="register-form-grid">
                            <div className="register-form-group">
                                <label htmlFor="register-name">Full Name</label>
                                <div className="register-input-wrapper">
                                    <FiUser className="register-input-icon" />
                                    <input
                                        id="register-name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="register-email">Email Address</label>
                                <div className="register-input-wrapper">
                                    <FiMail className="register-input-icon" />
                                    <input
                                        id="register-email"
                                        name="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="register-phone">Phone Number <span>(optional)</span></label>
                                <div className="register-input-wrapper">
                                    <FiPhone className="register-input-icon" />
                                    <input
                                        id="register-phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="register-department">Department</label>
                                <div className="register-input-wrapper">
                                    <FiBriefcase className="register-input-icon" />
                                    <select
                                        id="register-department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        disabled={loadingDepartments || departments.length === 0}
                                        required
                                    >
                                        <option value="">
                                            {loadingDepartments ? "Loading departments..." : "Select department"}
                                        </option>
                                        {departments.map((department) => (
                                            <option key={department._id} value={department.name}>
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="register-password">Password</label>
                                <div className="register-input-wrapper">
                                    <FiLock className="register-input-icon" />
                                    <input
                                        id="register-password"
                                        name="password"
                                        type="password"
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="register-confirm-password">Confirm Password</label>
                                <div className="register-input-wrapper">
                                    <FiLock className="register-input-icon" />
                                    <input
                                        id="register-confirm-password"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Re-enter your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="register-submit-button"
                            disabled={loading || loadingDepartments || departments.length === 0}
                        >
                            {loading ? "Creating account..." : <><FiUserPlus /> Create Account</>}
                        </button>
                    </form>

                    <div className="register-footer">
                        <p>
                            Already have an account?{" "}
                            <button type="button" onClick={() => navigate("/login")}>
                                Sign in
                            </button>
                        </p>
                        <span>SmartOps Service Management Platform</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
