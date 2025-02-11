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
    
        setSearchResults([]);
    
        if (!selectedCategory) {
            setValidationMessage("You must select a category.");
            return;
        }
    
        if (!searchInput && !selectedCity) {
            setValidationMessage("You must enter a name or choose a city.");
            return;
        }
    
        setValidationMessage("");
    
        try {
            const response = await fetch("http://localhost/Sal7ly/php_backend/search.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: searchInput,
                    category: selectedCategory,
                    city: selectedCity,
                }),
            });
    
            const data = await response.json();
            setSearchResults(data.results || []);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setSearchResults([]);
        }
    };
                                
    return (
        <div className="search-page">
            <div className="search-page__intro">
                <h2 className="search-page__intro-title">
                    Find the Services You Need | ابحث عن الخدمات التي تحتاجها
                </h2>
                <p className="search-page__description search-page__description--en">
                    Use the form below to search for professionals in your area. Select a category, choose a city, or search by name to find the best fit for your needs.
                </p>
                <p className="search-page__description search-page__description--ar">
                    استخدم النموذج أدناه للبحث عن الحرفيين في منطقتك. اختر فئة، وحدد مدينة، أو ابحث بالاسم للعثور على الأنسب لاحتياجاتك.
                </p>
            </div>
            
            <div className="search-page__container">
                <h1 className="search-page__title">Search for Services</h1>
                
                <form className="search-page__form" onSubmit={handleSearch}>
                    <div className="search-page__form-group">
                        <label className="search-page__label" htmlFor="searchInput">Name</label>
                        <input
                            type="text"
                            id="searchInput"
                            className="search-page__input"
                            placeholder="Enter name"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                    
                    <div className="search-page__form-group">
                        <label className="search-page__label" htmlFor="category">Category</label>
                        <select
                            id="category"
                            className="search-page__select"
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
                    
                    <div className="search-page__form-group">
                        <label className="search-page__label" htmlFor="city">City</label>
                        <select
                            id="city"
                            className="search-page__select"
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
                    
                    <button type="submit" className="search-page__button">
                        Search
                    </button>
                </form>

                <div className="search-page__results">
                    {searchResults.length > 0 ? (
                        searchResults.map((result, index) => (
                            <div key={index} className="search-page__result-card">
                                <img 
                                    src={result.picture} 
                                    alt={result.name} 
                                    className="search-page__result-image" 
                                />
                                <div className="search-page__result-info">
                                    <h3 className="search-page__result-name">{result.name}</h3>
                                    <p className="search-page__result-detail">Mobile: +{result.mobile}</p>
                                    <p className="search-page__result-detail">City: {result.city}</p>
                                    <Link 
                                        to={`/profile/${result.id}`} 
                                        className="search-page__profile-button"
                                    >
                                        View Full Profile
                                    </Link>
                                </div>
                                {result.bayesian > 0 && (
                                    <div className="search-page__rating-badge">
                                        {(Number(result.bayesian) || 0).toFixed(2)} 
                                        <span className="search-page__star">★</span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : validationMessage ? (
                        <p className="search-page__validation-message">{validationMessage}</p>
                    ) : (
                        <p className="search-page__empty-state">No results found or search cleared.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;