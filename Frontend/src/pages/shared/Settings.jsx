import { useState } from "react";
import { FiUser, FiLock, FiSave } from "react-icons/fi";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./Settings.css";

const Settings = () => {

    const { user, updateStoredUser } = useAuth();

    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || ""
    });
    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");
    const [profileSaving, setProfileSaving] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSaving, setPasswordSaving] = useState(false);

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        setProfileMessage("");
        setProfileError("");
        setProfileSaving(true);

        try {
            const response = await api.put("/users/profile", profileData);

            updateStoredUser(response.data.user);
            setProfileMessage("Profile updated successfully.");

        } catch (error) {
            setProfileError(
                error.response?.data?.message ||
                "Failed to update profile."
            );
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        setPasswordMessage("");
        setPasswordError("");

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New password and confirmation do not match.");
            return;
        }

        setPasswordSaving(true);

        try {
            await api.patch("/users/password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setPasswordMessage("Password changed successfully.");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

        } catch (error) {
            setPasswordError(
                error.response?.data?.message ||
                "Failed to change password."
            );
        } finally {
            setPasswordSaving(false);
        }
    };

    return (
        <div className="stg-page">

            <div className="stg-header">
                <h2>Settings</h2>
                <p>Manage your profile and account security.</p>
            </div>

            <div className="stg-grid">

                {/* ---------- Profile ---------- */}
                <form className="stg-card" onSubmit={handleProfileSubmit}>
                    <div className="stg-card__title">
                        <FiUser />
                        <span>Profile</span>
                    </div>

                    {profileMessage && (
                        <div className="stg-success">{profileMessage}</div>
                    )}
                    {profileError && (
                        <div className="stg-error">{profileError}</div>
                    )}

                    <label className="stg-label">Full name</label>
                    <input
                        className="stg-input"
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                    />

                    <label className="stg-label">Email address</label>
                    <input
                        className="stg-input"
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                    />

                    <label className="stg-label stg-label--readonly">Role</label>
                    <input
                        className="stg-input"
                        type="text"
                        value={user?.role || ""}
                        disabled
                    />

                    <button
                        className="stg-button"
                        type="submit"
                        disabled={profileSaving}
                    >
                        <FiSave />
                        {profileSaving ? "Saving..." : "Save profile"}
                    </button>
                </form>

                {/* ---------- Change password ---------- */}
                <form className="stg-card" onSubmit={handlePasswordSubmit}>
                    <div className="stg-card__title">
                        <FiLock />
                        <span>Change password</span>
                    </div>

                    {passwordMessage && (
                        <div className="stg-success">{passwordMessage}</div>
                    )}
                    {passwordError && (
                        <div className="stg-error">{passwordError}</div>
                    )}

                    <label className="stg-label">Current password</label>
                    <input
                        className="stg-input"
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                    />

                    <label className="stg-label">New password</label>
                    <input
                        className="stg-input"
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                    />

                    <label className="stg-label">Confirm new password</label>
                    <input
                        className="stg-input"
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                    />

                    <button
                        className="stg-button"
                        type="submit"
                        disabled={passwordSaving}
                    >
                        <FiSave />
                        {passwordSaving ? "Saving..." : "Change password"}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Settings;