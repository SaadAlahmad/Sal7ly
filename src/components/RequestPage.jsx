import React, { useEffect, useState, useContext } from "react";
import "../css/RequestPage.css";
import { UserContext } from "./UserContext";
import { Link, useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();
    const { user, setUser, loading } = useContext(UserContext);
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
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [applications, setApplications] = useState([]);
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);

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

    const fetchApplications = async (requestId) => {
        try {
            const response = await fetch("http://localhost/Sal7ly/php_backend/requesthandler.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "fetchApplications", request_id: requestId }),
            });
            const result = await response.json();
            if (result.success) {
                setApplications(result.applications);
                setShowApplicationsModal(true);
                setSelectedRequestId(requestId);
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Failed to fetch applications:", error);
        }
    };

    useEffect(() => {
        if (!loading && user) {
            fetchRequests();
        }
    }, [loading, user]);
    
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
                fetchRequests();
                setFormData({ service: "", details: "", city: "", location: "" });
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Failed to insert request:", error);
        }
    };

    const handleDeleteRequest = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this request?");
        if (!confirmDelete) return;
        
        try {
            const response = await fetch("http://localhost/Sal7ly/php_backend/requesthandler.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete", id, user_id: user.id }),
            });
            const result = await response.json();
            if (result.success) {
                fetchRequests();
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
                fetchRequests();
                setShowModifyForm(false);
                setModifyFormData({ service: "", details: "", city: "", location: "" });
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Failed to update request:", error);
        }
    };

    const handleAcceptApplication = async (application) => {
        const confirmAccept = window.confirm("Are you sure you want to accept this application?");
        if (!confirmAccept) return;
    
        try {
            const response = await fetch("http://localhost/Sal7ly/php_backend/accepthandler.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "accept",
                    request_id: selectedRequestId,
                    application_id: application.id,
                    craftsman_id: application.craftsman_id,
                    user_id: user.id,
                }),
            });
            const result = await response.json();
            if (result.success) {
                fetchRequests();
                setShowApplicationsModal(false);
                alert("Application accepted successfully!");
            } else {
                console.error(result.error);
                alert("Failed to accept application.");
            }
        } catch (error) {
            console.error("Error while accepting application:", error);
        }
    };    

    const handleLogout = async () => {
        try {
          const response = await fetch("http://localhost/Sal7ly/php_backend/logout.php", {
            method: "POST",
            credentials: "include",
          });
          const data = await response.json();
          if (data.success) {
            setUser(null);
          } else {
            console.error("Logout failed");
          }
        } catch (error) {
          console.error("Error during logout:", error);
        }
      };    

    if (loading) {
        return <p>Loading...</p>;
    }

    if (user && user.userType === 'craftsman') {
        return (
            <div className="request-page__auth-container">
                <h1>You are logged in as a craftsman</h1>
                <p>To be able to send custom requests you need to log in to a user account.</p>
                <div className="request-page__auth-buttons">
                <button onClick={handleLogout} className="request-page__logout">
                  Logout
                </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="request-page__auth-container">
                <h1>You are not logged in</h1>
                <p>If you want to send a request for signed craftspeople, you need to log in.</p>
                <div className="request-page__auth-buttons">
                    <Link to="/login" className="request-page__auth-button">
                        Log In
                    </Link>
                    <Link to="/signup" className="request-page__auth-button">
                        Sign Up
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="request-page">
            {showModifyForm && (
                <div className="request-page__modify-overlay">
                    <div className="request-page__modify-container">
                        <button className="request-page__modify-close" onClick={handleCloseModifyForm}>
                            &times;
                        </button>
                        <form className="request-page__modify-form" onSubmit={handleModifySubmit}>
                            {[
                                { name: "service", type: "select", options: services },
                                { name: "details", type: "textarea", placeholder: "Describe the job" },
                                { name: "city", type: "select", options: cities },
                                { name: "location", type: "text", placeholder: "Enter exact location" },
                            ].map(({ name, type, options, placeholder }, idx) => (
                                <div className="request-page__form-group" key={idx}>
                                    <label className="request-page__form-label" htmlFor={name}>
                                        {name.charAt(0).toUpperCase() + name.slice(1)}
                                    </label>
                                    {type === "select" ? (
                                        <select
                                            className="request-page__form-select"
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
                                            className="request-page__form-textarea"
                                            id={name}
                                            name={name}
                                            placeholder={placeholder}
                                            value={modifyFormData[name]}
                                            onChange={handleModifyInputChange}
                                            required
                                        />
                                    ) : (
                                        <input
                                            className="request-page__form-input"
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
                            <button type="submit" className="request-page__submit request-page__submit--modify">
                                Update Service
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <header className="request-page__header">
                <h1 className="request-page__title">Submit a Job Request</h1>
            </header>

            <form className="request-page__form" onSubmit={handleSubmit}>
                {[
                    { name: "service", type: "select", options: services },
                    { name: "details", type: "textarea", placeholder: "Describe the job" },
                    { name: "city", type: "select", options: cities },
                    { name: "location", type: "text", placeholder: "Enter exact location" },
                ].map(({ name, type, options, placeholder }, idx) => (
                    <div className="request-page__form-group" key={idx}>
                        <label className="request-page__form-label" htmlFor={name}>
                            {name.charAt(0).toUpperCase() + name.slice(1)}
                        </label>
                        {type === "select" ? (
                            <select
                                className="request-page__form-select"
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
                                className="request-page__form-textarea"
                                id={name}
                                name={name}
                                placeholder={placeholder}
                                value={formData[name]}
                                onChange={handleInputChange}
                                required
                            />
                        ) : (
                            <input
                                className="request-page__form-input"
                                type={type === "text" ? "text" : type}
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
                <button type="submit" className="request-page__submit">
                    Submit Request
                </button>
            </form>

            <section className="request-page__requests">
                <h2 className="request-page__subtitle">Active Requests</h2>
                {activeRequests.length === 0 ? (
                    <p className="request-page__empty">No active requests found.</p>
                ) : (
                    <ul className="request-page__requests-list">
                        {activeRequests.map((request) => (
                            <li key={request.id} className="request-page__request-item">
                                <p className="request-page__request-id">ID: {request.id}</p>
                                <h3 className="request-page__request-title">{request.service} in {request.city}</h3>
                                <div className="request-page__request-details">
                                    <p>{request.details}</p>
                                </div>
                                <p className="request-page__request-location">
                                    <span className="request-page__location-label">Location: </span> 
                                    {request.location}
                                </p>
                                <div className="request-page__request-actions">
                                    <button
                                        onClick={() => handleModifyRequest(request.id)}
                                        className="request-page__button request-page__button--modify"
                                    >
                                        Modify
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRequest(request.id)}
                                        className="request-page__button request-page__button--delete"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => fetchApplications(request.id)}
                                        className="request-page__button request-page__button--applications"
                                    >
                                        Show Applications ({request.applicationsCount || 0})
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {showApplicationsModal && (
                <div className="request-page__applications-overlay">
                    <div className="request-page__applications-modal">
                        <button
                            className="request-page__applications-close"
                            onClick={() => setShowApplicationsModal(false)}
                        >
                            &times;
                        </button>
                        <h2 className="request-page__applications-title">
                            Applications for Request #{selectedRequestId}
                        </h2>
                        {applications.length === 0 ? (
                            <p className="request-page__applications-empty">No applications found.</p>
                        ) : (
                            <ul className="request-page__applications-list">
                                {applications.map((app) => (
                                    <li key={app.id} className="request-page__application-item">
                                        <div className="request-page__application-header">
                                            <h3 className="request-page__application-craftsman">
                                                Craftsman:{" "}
                                                <button
                                                    onClick={() => navigate(`/profile/${app.craftsman_id}`)}
                                                    className="request-page__craftsman-button"
                                                >
                                                    {app.craftsman_name}
                                                </button>
                                            </h3>
                                            <p className="request-page__application-mobile">
                                                <span className="request-page__mobile-label">Mobile:</span> 
                                                +{app.craftsman_mobile}
                                            </p>
                                        </div>
                                        <div className="request-page__application-message">
                                            <p className="request-page__message-label">Message:</p>
                                            <p className="request-page__message-content">{app.message}</p>
                                        </div>
                                        <div className="request-page__application-footer">
                                            <p className="request-page__application-date">
                                                Submitted on:{" "}
                                                {new Date(app.created_at).toLocaleString()}
                                            </p>
                                            <button
                                                className="request-page__button request-page__button--accept"
                                                onClick={() => handleAcceptApplication(app)}
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestPage;