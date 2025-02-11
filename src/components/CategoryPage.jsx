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

    if (loading) return <p className="category-page__loading">Loading...</p>;

    return (
        <div className="category-page">
            <h1 className="category-page__title">
                {category.charAt(0).toUpperCase() + category.slice(1)}s
            </h1>
            
            <div className="category-page__grid">
                {professionals.length > 0 ? (
                    professionals.map((professional) => (
                        <button
                            key={professional.id}
                            className="category-page__card"
                            onClick={() => navigate(`/profile/${professional.id}`)}
                        >
                            <div className="category-page__rating">
                                {professional.bayesian && professional.bayesian > 0 ? (
                                    <>
                                        <span className="category-page__rating-value">
                                            <strong>Rating: </strong>{(Number(professional.bayesian) || 0).toFixed(2)}
                                        </span>
                                        <span className="category-page__rating-star">&#9733;</span>
                                    </>
                                ) : null}
                            </div>
                            
                            <img
                                src={professional.picture.startsWith('data:image') ? professional.picture : `/pictures/${professional.picture}`}
                                alt={professional.name}
                                className="category-page__image"
                            />
                            
                            <h3 className="category-page__name">{professional.name}</h3>
                            
                            <p className="category-page__label">City</p>
                            <p className="category-page__value">{professional.city}</p>
                            
                            <p className="category-page__label">Mobile</p>
                            <p className="category-page__value">+{professional.mobile}</p>
                        </button>
                    ))
                ) : (
                    <p className="category-page__empty-state">No craftspeople found in this category.</p>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;