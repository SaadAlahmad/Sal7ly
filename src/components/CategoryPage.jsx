import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../css/CategoryPage.css';

const CategoryPage = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfessionals = async () => {
            try {
                const response = await fetch(
                    `http://localhost/Sal7ly/php_backend/category.php?category=${category}`
                );
                const result = await response.json();

                if (result.error) {
                    console.error(result.error);
                    setProfessionals([]);
                } else {
                    setProfessionals(result.professionals || []);
                }
            } catch (error) {
                console.error("Error fetching craftspeople:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfessionals();
    }, [category]);

    if (loading) return <p className="loadingp">Loading...</p>;

    return (
        <div className="category-results">
            <h1>{category.charAt(0).toUpperCase() + category.slice(1)}s</h1>
            <div className="results-grid">
                {professionals.length > 0 ? (
                    professionals.map((professional) => (
                        <button
                            key={professional.id}
                            className="result-card"
                            onClick={() => navigate(`/profile/${professional.id}`)}
                        >
                            <div className="rating-container">
                                {professional.bayesian && professional.bayesian > 0 ? (
                                    <>
                                        <span className="rating">
                                            <strong>Rating: </strong>{professional.bayesian.toFixed(2)}
                                        </span>
                                        <span className="catStar">&#9733;</span>
                                    </>
                                ) : (
                                    <></>  
                                )}
                            </div>
                            <img
                                src={professional.picture.startsWith('data:image') ? professional.picture : `/pictures/${professional.picture}`}
                                alt={professional.name}
                            />
                            <h3>{professional.name}</h3>
                            <p className="pS">City</p>
                            <p>{professional.city}</p>
                            <p className="pS">Mobile</p>
                            <p>+{professional.mobile}</p>
                        </button>
                    ))
                ) : (
                    <p>No craftspeople found in this category.</p>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
