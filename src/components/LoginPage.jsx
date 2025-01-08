import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../css/LoginPage.css";
import { UserContext } from "./UserContext";

const LoginPage = () => {
    const [loginType, setLoginType] = useState("user");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [passwordVisible, setPasswordVisible] = useState(false);
    const { setUser } = useContext(UserContext); // Use the context to update the user state
    const navigate = useNavigate(); // Initialize the useNavigate hook

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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData, userType: loginType }),
            });

            const result = await response.json();

            if (response.ok && result.status) {
                alert(result.message || "Successfully logged in!");

                // Update the user state globally
                setUser({
                    id: result.data.id,
                    name: result.data.name,
                    email: result.data.email,
                    userType: loginType,
                });

                // Redirect to the homepage
                navigate("/");

                // Clear form data
                setFormData({ email: "", password: "" });
            } else {
                alert(result.error || "Log in failed. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again later.");
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
