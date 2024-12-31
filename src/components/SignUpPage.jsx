import React, { useState } from "react";
import "../css/SignUpPage.css";

const cities = [
    "Jenin",
    "Tubas",
    "Tulkarem",
    "Nablus",
    "Qalqilya",
    "Salfit",
    "Ramallah and al-Birah",
    "Jericho",
    "Bethlehem",
    "Hebron",
];

const categories = [
    "Plumber",
    "Blacksmith",
    "Electrician",
    "Mechanic",
    "Carpenter",
    "Gardener",
    "Mason",
    "Cleaner",
    "Tailor",
    "Tiler",
];

const SignUpPage = () => {
    const [userType, setUserType] = useState("user");
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        city: "",
        password: "",
        service: "",
        bio: "",
        workSamples: [],
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, workSamples: Array.from(e.target.files) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        alert(`Successfully registered as a ${userType === "user" ? "User" : "Professional"}!`);
        setFormData({
            email: "",
            phone: "",
            city: "",
            password: "",
            service: "",
            bio: "",
            workSamples: [],
        });
    };

    return (
        <div className="signup-container">
            <header className="signup-header">
                <h1>Sign Up</h1>
                <p>Register as a User or Professional</p>
            </header>
            <div className="signup-type">
                <button
                    className={`signup-type-button ${userType === "user" ? "active" : ""}`}
                    onClick={() => setUserType("user")}
                >
                    Register as User
                </button>
                <button
                    className={`signup-type-button ${userType === "professional" ? "active" : ""}`}
                    onClick={() => setUserType("professional")}
                >
                    Register as Professional
                </button>
            </div>
            <form className="signup-form" onSubmit={handleSubmit}>
                {/* Shared Fields */}
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
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="text"
                        id="phone"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
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
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Professional-Specific Fields */}
                {userType === "professional" && (
                    <>
                        <div className="form-group">
                            <label htmlFor="service">Service</label>
                            <select
                                id="service"
                                name="service"
                                value={formData.service}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select a service</option>
                                {categories.map((service, index) => (
                                    <option key={index} value={service}>
                                        {service}
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
