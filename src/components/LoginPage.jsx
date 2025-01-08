import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/LoginPage.css";
import { UserContext } from "./UserContext";

const LoginPage = () => {
    const [loginType, setLoginType] = useState("user");
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost/Sal7ly/php_backend/loginhandler.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, userType: loginType }),
            });

            const result = await response.json();

            if (response.ok && result.status) {
                alert(result.message || "Successfully logged in!");

                // Fetch updated user data from sessionhandler.php
                await fetchUserData();

                // Redirect to the homepage
                navigate("/");
                setFormData({ email: "", password: "" });
            } else {
                alert(result.error || "Log in failed. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again later.");
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await fetch("http://localhost/Sal7ly/php_backend/sessionhandler.php", {
                credentials: "include",
            });

            const data = await response.json();

            if (data.loggedIn) {
                if(data.userType === 'craftsman') {
                    setUser({
                        id: data.id,
                        name: data.name,
                        email: data.email,
                        userType: data.userType,
                        city: data.city,
                        category: data.category,
                    });    
                } else {
                    setUser({
                        id: data.id,
                        name: data.name,
                        email: data.email,
                        userType: data.userType,
                    });    
                }
            } else {
                alert("Failed to fetch user data after login.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("An error occurred while fetching user data.");
        }
    };

    return (
        <div className="login-container">
            <div className="side-menu">
                <div
                    className={`side-menu-item ${loginType === "user" ? "active" : ""}`}
                    onClick={() => setLoginType("user")}
                >
                    Login as User
                </div>
                <div
                    className={`side-menu-item ${loginType === "craftsman" ? "active" : ""}`}
                    onClick={() => setLoginType("craftsman")}
                >
                    Login as Craftsman
                </div>
            </div>

            <div className="login-content">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group password-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-container">
                            <input
                                type={passwordVisible ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="submit-button">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
