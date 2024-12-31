import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/SearchPage.css";

const SearchPage = () => {
    const [searchInput, setSearchInput] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [validationMessage, setValidationMessage] = useState("");

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

    const handleSearch = async (e) => {
        e.preventDefault();
    
        // Clear previous results immediately
        setSearchResults([]);
    
        // Validation: Ensure category is selected
        if (!selectedCategory) {
            setValidationMessage("You must select a category.");
            return;
        }
    
        // Validation: Ensure at least one of searchInput or selectedCity is provided
        if (!searchInput && !selectedCity) {
            setValidationMessage("You must enter a name or choose a city.");
            return;
        }
    
        // Clear validation message when inputs are valid
        setValidationMessage("");
    
        try {
            const response = await fetch("http://localhost/test-project/test-project/php_backend/search.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: searchInput,         // Allow empty string
                    category: selectedCategory, // Required field
                    city: selectedCity,        // Allow empty string
                }),
            });
    
            const data = await response.json();
            setSearchResults(data.results || []); // Populate results or set to an empty array if none
        } catch (error) {
            console.error("Error fetching search results:", error);
            setSearchResults([]); // Ensure results remain empty on error
        }
    };
                                
    return (
        <>
            <div className="search-container">
                <div className="search-intro">
                    <h2 className="intro-title">
                        Find the Services You Need | ابحث عن الخدمات التي تحتاجها
                    </h2>
                    <p className="intro-description-en">
                        Use the form below to search for professionals in your area. Select a category, choose a city, or search by name to find the best fit for your needs.
                    </p>
                    <p className="intro-description-ar">
                        استخدم النموذج أدناه للبحث عن الحرفيين في منطقتك. اختر فئة، وحدد مدينة، أو ابحث بالاسم للعثور على الأنسب لاحتياجاتك.
                    </p>
                </div>
                <div className="search-page">
                    <h1>Search for Services</h1>
                    <form className="search-form" onSubmit={handleSearch}>
                        <div className="form-group">
                            <label htmlFor="searchInput">Name</label>
                            <input
                                type="text"
                                id="searchInput"
                                placeholder="Enter name"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
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
                            <label htmlFor="city">City</label>
                            <select
                                id="city"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                            >
                                <option value="">Select a city</option>
                                {cities.map((city, index) => (
                                    <option key={index} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="search-button">
                            Search
                        </button>
                    </form>
                    <div className="results-container">
                        {searchResults.length > 0 ? (
                            searchResults.map((result, index) => (
                                <div key={index} className="search-result-card">
                                    <img src={result.picture} alt={result.name} className="search-result-picture" />
                                    <div className="search-result-info">
                                        <h3>{result.name}</h3>
                                        <p>Mobile: {result.mobile}</p>
                                        <p>City: {result.city}</p>
                                        <Link to={`/profile/${result.id}`} className="search-profile-button">
                                            View Full Profile
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            validationMessage ? (
                                <p style={{ color: "red" }}>{validationMessage}</p>
                            ) : (
                                <p>No results found or search cleared.</p>
                            )
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchPage;
