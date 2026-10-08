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
        <div className="settings-page">

            <div className="settings-header">
                <h2>Settings</h2>
                <p>Manage your profile and account security.</p>
            </div>

            <div className="settings-grid">

                <form className="settings-card" onSubmit={handleProfileSubmit}>
                    <div className="settings-card-title">
                        <FiUser />
                        <h3>Profile</h3>
                    </div>

                    {profileMessage && (
                        <div className="settings-success">{profileMessage}</div>
                    )}
                    {profileError && (
                        <div className="settings-error">{profileError}</div>
                    )}

                    <label>Full name</label>
                    <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                    />

                    <label>Email address</label>
                    <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                    />

                    <label className="settings-readonly-label">Role</label>
                    <input
                        type="text"
                        value={user?.role || ""}
                        disabled
                    />

                    <button type="submit" disabled={profileSaving}>
                        <FiSave />
                        {profileSaving ? "Saving..." : "Save profile"}
                    </button>
                </form>

                <form className="settings-card" onSubmit={handlePasswordSubmit}>
                    <div className="settings-card-title">
                        <FiLock />
                        <h3>Change password</h3>
                    </div>

                    {passwordMessage && (
                        <div className="settings-success">{passwordMessage}</div>
                    )}
                    {passwordError && (
                        <div className="settings-error">{passwordError}</div>
                    )}

                    <label>Current password</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                    />

                    <label>New password</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                    />

                    <label>Confirm new password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                    />

                    <button type="submit" disabled={passwordSaving}>
                        <FiSave />
                        {passwordSaving ? "Saving..." : "Change password"}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Settings;
