import React, { useState } from "react";
import "../css/SignUpPage.css";

const SignUpPage = () => {
    const [userType, setUserType] = useState("user");
    const [countryCode, setCountryCode] = useState("+970");
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

    const categories = [
        "Plumber", "Blacksmith", "Electrician", "Mechanic", 
        "Carpenter", "Gardener", "Mason", "Cleaner", "Tailor", "Tiler"
    ];

    const cities = [
        "Jenin", "Tubas", "Tulkarem", "Nablus", "Qalqilya", 
        "Salfit", "Ramallah and al-Birah", "Jericho", "Bethlehem", "Hebron"
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

        let mobile = formData.mobile.trim();
        if (mobile.startsWith("0")) {
            mobile = mobile.slice(1);
        }
        if (mobile.length > 10) {
            alert("Mobile number must not exceed 10 digits.");
            return;
        }

        const fullMobile = countryCode + mobile;

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

        formDataToSend.append("mobile", fullMobile);
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
        <div className="signup-page">
            <header className="signup-page__header">
                <h1 className="signup-page__title">Sign Up</h1>
                <p className="signup-page__subtitle">Register as a User or Craftsman</p>
            </header>

            <div className="signup-page__type">
                <button
                    type="button"
                    className={`signup-page__type-button ${userType === "user" ? "signup-page__type-button--active" : ""}`}
                    onClick={() => setUserType("user")}
                >
                    Register as User
                </button>
                <button
                    type="button"
                    className={`signup-page__type-button ${userType === "craftsman" ? "signup-page__type-button--active" : ""}`}
                    onClick={() => setUserType("craftsman")}
                >
                    Register as Craftsman
                </button>
            </div>

            <form className="signup-page__form" onSubmit={handleSubmit}>
                <div className="signup-page__form-group">
                    <label className="signup-page__label" htmlFor="name">Name</label>
                    <input
                        className="signup-page__input"
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="signup-page__form-group">
                    <label className="signup-page__label" htmlFor="email">Email</label>
                    <input
                        className="signup-page__input"
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="signup-page__form-group">
                    <label className="signup-page__label" htmlFor="mobile">Mobile Number</label>
                    <div className="signup-page__mobile-container">
                        <select
                            className="signup-page__country-select"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            required
                        >
                            <option value="+970">+970</option>
                            <option value="+972">+972</option>
                        </select>
                        <input
                            className="signup-page__input"
                            type="text"
                            id="mobile"
                            name="mobile"
                            placeholder="Enter your mobile number"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="signup-page__form-group">
                    <label className="signup-page__label" htmlFor="city">Location (City)</label>
                    <select
                        className="signup-page__select"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select your city</option>
                        {cities.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                {userType === "craftsman" && (
                    <div className="signup-page__form-group">
                        <label className="signup-page__label" htmlFor="picture">
                            Upload Profile Picture (Optional)
                        </label>
                        <input
                            className="signup-page__input signup-page__input--file"
                            type="file"
                            id="picture"
                            name="picture"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </div>
                )}

                <div className="signup-page__form-group">
                    <label className="signup-page__label" htmlFor="password">Password</label>
                    <input
                        className="signup-page__input"
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {userType === "craftsman" && (
                    <>
                        <div className="signup-page__form-group">
                            <label className="signup-page__label" htmlFor="category">Category</label>
                            <select
                                className="signup-page__select"
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div className="signup-page__form-group">
                            <label className="signup-page__label" htmlFor="bio">Bio</label>
                            <textarea
                                className="signup-page__textarea"
                                id="bio"
                                name="bio"
                                placeholder="Write about yourself and your experience"
                                value={formData.bio}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="signup-page__form-group">
                            <label className="signup-page__label" htmlFor="workSamples">
                                Upload Work Samples
                            </label>
                            <input
                                className="signup-page__input signup-page__input--file"
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

                <button type="submit" className="signup-page__submit-button">
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default SignUpPage;