import React, { useEffect, useState, useContext } from "react";
import "../css/RequestPage.css";
import { UserContext } from "./UserContext";
import { Link } from "react-router-dom";

const services = [
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

const RequestPage = () => {
    const { user, loading } = useContext(UserContext);
    const [activeRequests, setActiveRequests] = useState([]);
    const [formData, setFormData] = useState({
        service: "",
        details: "",
        city: "",
        location: "",
    });
    const [modifyFormData, setModifyFormData] = useState({
        service: "",
        details: "",
        city: "",
        location: "",
    });
    const [showModifyForm, setShowModifyForm] = useState(false);
    const [modifyRequestId, setModifyRequestId] = useState(null);

    const fetchRequests = async () => {
        if (!user) return;
        try {
            const response = await fetch("http://localhost/Sal7ly/php_backend/requesthandler.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "fetch", user_id: user.id }),
            });
            const result = await response.json();
            if (result.success) {
                setActiveRequests(result.requests);
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Failed to fetch requests:", error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleModifyInputChange = (e) => {
        const { name, value } = e.target;
        setModifyFormData({ ...modifyFormData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost/Sal7ly/php_backend/requesthandler.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "insert", user_id: user.id, ...formData }),
            });
            const result = await response.json();
            if (result.success) {
                fetchRequests(); // Refresh the requests
                setFormData({ service: "", details: "", city: "", location: "" });
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Failed to insert request:", error);
        }
    };

    const handleDeleteRequest = async (id) => {
        try {
            const response = await fetch("http://localhost/Sal7ly/php_backend/requesthandler.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete", id, user_id: user.id }),
            });
            const result = await response.json();
            if (result.success) {
                fetchRequests(); // Refresh the requests
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Failed to delete request:", error);
        }
    };

    const handleModifyRequest = (id) => {
        const requestToModify = activeRequests.find((request) => request.id === id);
        setModifyFormData(requestToModify);
        setModifyRequestId(id);
        setShowModifyForm(true);
    };

    const handleCloseModifyForm = () => {
        setShowModifyForm(false);
        setModifyFormData({ service: "", details: "", city: "", location: "" });
    };

    const handleModifySubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost/Sal7ly/php_backend/requesthandler.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "update", id: modifyRequestId, user_id: user.id, ...modifyFormData }),
            });
            const result = await response.json();
            if (result.success) {
                fetchRequests(); // Refresh the requests
                setShowModifyForm(false);
                setModifyFormData({ service: "", details: "", city: "", location: "" });
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Failed to update request:", error);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!user) {
        return (
            <div className="not-logged-in-container">
                <h1>You are not logged in</h1>
                <p>If you want to send a request for signed contractors, you need to log in.</p>
                <div className="auth-buttons">
                    <Link to="/login" className="auth-button">
                        Log In
                    </Link>
                    <Link to="/signup" className="auth-button">
                        Sign Up
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="request-container">
            {showModifyForm && (
                <div className="modify-form-overlay">
                    <div className="modify-form-container">
                        <button className="close-button" onClick={handleCloseModifyForm}>
                            X
                        </button>
                        <form className="modify-form" onSubmit={handleModifySubmit}>
                            {[
                                { name: "service", type: "select", options: services },
                                { name: "details", type: "textarea", placeholder: "Describe the job" },
                                { name: "city", type: "select", options: cities },
                                { name: "location", type: "text", placeholder: "Enter exact location" },
                            ].map(({ name, type, options, placeholder }, idx) => (
                                <div className="form-group" key={idx}>
                                    <label htmlFor={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</label>
                                    {type === "select" ? (
                                        <select
                                            id={name}
                                            name={name}
                                            value={modifyFormData[name]}
                                            onChange={handleModifyInputChange}
                                            required
                                        >
                                            <option value="">Select a {name}</option>
                                            {options.map((option, index) => (
                                                <option key={index} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    ) : type === "textarea" ? (
                                        <textarea
                                            id={name}
                                            name={name}
                                            placeholder={placeholder}
                                            value={modifyFormData[name]}
                                            onChange={handleModifyInputChange}
                                            required
                                        />
                                    ) : (
                                        <input
                                            type={type}
                                            id={name}
                                            name={name}
                                            placeholder={placeholder}
                                            value={modifyFormData[name]}
                                            onChange={handleModifyInputChange}
                                            required
                                        />
                                    )}
                                </div>
                            ))}
                            <button type="submit" className="submit-button">
                                Update Service
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <header className="request-header">
                <h1>Submit a Job Request</h1>
            </header>
            <form className="request-form" onSubmit={handleSubmit}>
                {[
                    { name: "service", type: "select", options: services },
                    { name: "details", type: "textarea", placeholder: "Describe the job" },
                    { name: "city", type: "select", options: cities },
                    { name: "location", type: "text", placeholder: "Enter exact location" },
                ].map(({ name, type, options, placeholder }, idx) => (
                    <div className="form-group" key={idx}>
                        <label htmlFor={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</label>
                        {type === "select" ? (
                            <select
                                id={name}
                                name={name}
                                value={formData[name]}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select a {name}</option>
                                {options.map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        ) : type === "textarea" ? (
                            <textarea
                                id={name}
                                name={name}
                                placeholder={placeholder}
                                value={formData[name]}
                                onChange={handleInputChange}
                                required
                            />
                        ) : (
                            <input
                                type={type === "text" ? "text" : type} // Safeguard for valid types
                                id={name}
                                name={name}
                                placeholder={placeholder}
                                value={formData[name]}
                                onChange={handleInputChange}
                                required
                            />
                        )}
                    </div>
                ))}
                <button type="submit" className="submit-button">
                    Submit Request
                </button>
            </form>
            <section className="active-requests-section">
                <h2>Active Requests</h2>
                {activeRequests.length === 0 ? (
                    <p>No active requests found.</p>
                ) : (
                    <ul className="requests-list">
                        {activeRequests.map((request) => (
                            <li key={request.id} className="request-item">
                                <strong>{request.service}</strong> in {request.city}
                                <p>{request.details}</p>
                                <p>
                                    <em>Location:</em> {request.location}
                                </p>
                                <button
                                    onClick={() => handleModifyRequest(request.id)}
                                    className="modify-button"
                                >
                                    Modify
                                </button>
                                <button
                                    onClick={() => handleDeleteRequest(request.id)}
                                    className="delete-button"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default RequestPage;
