import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/EditProfile.css";

const EditProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState("info");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`http://localhost/Sal7ly/php_backend/get_user.php?id=${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setFormData((prevData) => ({
                        ...prevData,
                        name: data.name || "",
                        email: data.email || "",
                        mobile: data.mobile || "",
                    }));
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching user data:", err);
                setError("Failed to load user data.");
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (activeTab === "password" && formData.newPassword !== formData.confirmPassword) {
            alert("New password and confirm password do not match.");
            return;
        }

        try {
            const response = await fetch("http://localhost/Sal7ly/php_backend/update_user.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword,
                }),
            });

            const result = await response.json();

            if (result.error) {
                alert(result.error);
            } else {
                alert("Profile updated successfully!");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred while updating profile.");
        }
    };

    if (loading) return <div>Loading profile...</div>;
    if (error) return <div>{error}</div>;

    return (
        <>
            <div className="edit-profile">
                <div className="edit-profile__menu">
                    <div
                        className={`edit-profile__menu-item ${activeTab === "info" ? "edit-profile__menu-item--active" : ""}`}
                        onClick={() => setActiveTab("info")}
                    >
                        Edit User Information
                    </div>
                    <div
                        className={`edit-profile__menu-item ${activeTab === "password" ? "edit-profile__menu-item--active" : ""}`}
                        onClick={() => setActiveTab("password")}
                    >
                        Edit Password
                    </div>
                </div>

                <div className="edit-profile__content">
                    <h2 className="edit-profile__title">Edit Profile</h2>
                    <form className="edit-profile__form" onSubmit={handleSubmit}>
                        
                        {activeTab === "info" ? (
                            <>
                                <div className="edit-profile__form-group">
                                    <label className="edit-profile__label">Name:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="edit-profile__input"
                                        required
                                    />
                                </div>

                                <div className="edit-profile__form-group">
                                    <label className="edit-profile__label">Email:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="edit-profile__input"
                                        required
                                    />
                                </div>

                                <div className="edit-profile__form-group">
                                    <label className="edit-profile__label">Mobile Number:</label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="edit-profile__input"
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="edit-profile__form-group">
                                    <label className="edit-profile__label">Current Password:</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="edit-profile__input"
                                        required
                                    />
                                </div>

                                <div className="edit-profile__form-group">
                                    <label className="edit-profile__label">New Password:</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="edit-profile__input"
                                        required
                                    />
                                </div>

                                <div className="edit-profile__form-group">
                                    <label className="edit-profile__label">Confirm Password:</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="edit-profile__input"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <button type="submit" className="edit-profile__submit-button">
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditProfile;