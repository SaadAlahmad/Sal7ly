import React, { useState } from "react";
import "../css/RequestPage.css";

const services = [
    "Plumber",
    "Woodworker",
    "Blacksmith",
    "Electrician",
    "Mechanic",
    "Painter",
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
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Replace this with your authentication logic
    const [activeRequests, setActiveRequests] = useState([]);
    const [formData, setFormData] = useState({
        service: "",
        details: "",
        city: "",
        location: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setActiveRequests([...activeRequests, { ...formData, id: Date.now() }]);
        setFormData({ service: "", details: "", city: "", location: "" });
    };

    const handleDeleteRequest = (id) => {
        setActiveRequests(activeRequests.filter((request) => request.id !== id));
    };

    const handleModifyRequest = (id) => {
        const requestToModify = activeRequests.find((request) => request.id === id);
        setFormData(requestToModify);
        setActiveRequests(activeRequests.filter((request) => request.id !== id));
    };

    if (!isLoggedIn) {
        return (
            <div className="request-container">
                <h1>Please Log In</h1>
                <p>You must be logged in to submit or view requests.</p>
            </div>
        );
    }

    return (
        <div className="request-container">
            <header className="request-header">
                <h1>Submit a Job Request</h1>
                <button
                    className="active-requests-button"
                    onClick={() => alert("Showing active requests...")}
                >
                    View Active Requests
                </button>
            </header>
            <form className="request-form" onSubmit={handleSubmit}>
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
                        {services.map((service, index) => (
                            <option key={index} value={service}>
                                {service}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="details">Job Details</label>
                    <textarea
                        id="details"
                        name="details"
                        placeholder="Describe the job"
                        value={formData.details}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="city">City</label>
                    <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select a city</option>
                        {cities.map((city, index) => (
                            <option key={index} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="location">Exact Location</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        placeholder="Enter exact location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                    />
                </div>
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
