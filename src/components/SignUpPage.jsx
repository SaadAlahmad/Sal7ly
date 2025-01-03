import React, { useState } from "react";
import "../css/SignUpPage.css";

const SignUpPage = () => {
    const [userType, setUserType] = useState("user");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        city: "",
        password: "",
        category: "",
        bio: "",
        picture: null,
        workSamples: [],
    });

    const [passwordVisible, setPasswordVisible] = useState(false);

    const categories = [
        "Plumber", "Blacksmith", "Electrician", "Mechanic", "Carpenter", "Gardener", "Mason", "Cleaner", "Tailor", "Tiler"
    ];

    const cities = [
        "Jenin", "Tubas", "Tulkarem", "Nablus", "Qalqilya", "Salfit", "Ramallah and al-Birah", "Jericho", "Bethlehem", "Hebron"
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === "picture") {
            setFormData({ ...formData, picture: files[0] });
        } else if (name === "workSamples") {
            setFormData({ ...formData, workSamples: Array.from(files) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        Object.keys(formData).forEach((key) => {
            if (key === "workSamples") {
                formData.workSamples.forEach((file, index) => {
                    formDataToSend.append(`workSamples[${index}]`, file);
                });
            } else if (formData[key] !== null) {
                formDataToSend.append(key, formData[key]);
            }
        });
        formDataToSend.append("userType", userType);

        try {
            const response = await fetch("http://localhost/Sal7ly/php_backend/signuphandler.php", {
                method: "POST",
                body: formDataToSend,
            });

            const result = await response.json();

            if (response.ok && result.status) {
                alert(result.message || "Successfully registered!");
                setFormData({
                    name: "", email: "", mobile: "", city: "", password: "", category: "", bio: "", picture: null, workSamples: []
                });
            } else {
                alert(result.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again later.");
        }
    };

    return (
        <div className="signup-container">
            <header className="signup-header">
                <h1>Sign Up</h1>
                <p>Register as a User or Craftsman</p>
            </header>
            <div className="signup-type">
                <button
                    className={`signup-type-button ${userType === "user" ? "active" : ""}`}
                    onClick={() => setUserType("user")}
                >
                    Register as User
                </button>
                <button
                    className={`signup-type-button ${userType === "craftsman" ? "active" : ""}`}
                    onClick={() => setUserType("craftsman")}
                >
                    Register as Craftsman
                </button>
            </div>
            <form className="signup-form" onSubmit={handleSubmit}>
                {/* Shared Fields */}
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
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
                <div className="form-group">
                    <label htmlFor="mobile">Mobile Number</label>
                    <input
                        type="text"
                        id="mobile"
                        name="mobile"
                        placeholder="Enter your mobile number"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="city">Location (City)</label>
                    <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select your city</option>
                        {cities.map((city, index) => (
                            <option key={index} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="picture">Upload Profile Picture (Optional)</label>
                    <input
                        type="file"
                        id="picture"
                        name="picture"
                        onChange={handleFileChange}
                        accept="image/*"
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
                        <button
                            type="button"
                            className="toggle-password-button"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            aria-label="Toggle password visibility"
                        >
                            {passwordVisible ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                {/* Craftsman-Specific Fields */}
                {userType === "craftsman" && (
                    <>
                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="bio">Bio</label>
                            <textarea
                                id="bio"
                                name="bio"
                                placeholder="Write about yourself and your experience"
                                value={formData.bio}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="workSamples">Upload Work Samples</label>
                            <input
                                type="file"
                                id="workSamples"
                                name="workSamples"
                                multiple
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </div>
                    </>
                )}

                <button type="submit" className="submit-button">
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default SignUpPage;
