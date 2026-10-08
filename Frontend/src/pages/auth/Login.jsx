import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import "./Login.css";

const Login = () => {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await login(
                formData.email,
                formData.password
            );

            const role = response.user.role;

            if (role === "admin") {
                navigate("/admin");
            } else if (role === "staff") {
                navigate("/staff");
            } else {
                navigate("/user");
            }

        } catch (error) {

            const message =
                error.response?.data?.message ||
                "Login failed. Please try again.";

            setError(message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-container">

                <div className="login-brand-section">

                    <div className="brand-logo">
                        S
                    </div>

                    <h1>SmartOps</h1>

                    <p>
                        Smart Operations & Service Request Management
                    </p>

                    <div className="brand-description">
                        <h2>Work smarter. Resolve faster.</h2>

                        <p>
                            Manage service requests, tasks, assignments,
                            and operations from one centralized platform.
                        </p>
                    </div>

                </div>

                <div className="login-form-section">

                    <div className="login-header">

                        <h2>Welcome back</h2>

                        <p>
                            Sign in to your SmartOps account
                        </p>

                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="input-wrapper">

                                <FiMail className="input-icon" />

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                />

                            </div>

                        </div>

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="input-wrapper">

                                <FiLock className="input-icon" />

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <FiEyeOff />
                                    ) : (
                                        <FiEye />
                                    )}
                                </button>

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading ? (
                                "Signing in..."
                            ) : (
                                <>
                                    <FiLogIn />
                                    Sign In
                                </>
                            )}

                        </button>

                    </form>

                    <div className="login-footer">
                        <p className="login-register-prompt">
                            New to SmartOps?{" "}
                            <button type="button" onClick={() => navigate("/register")}>
                                Create an employee account
                            </button>
                        </p>
                        <p>
                            SmartOps Service Management Platform
                        </p>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;
