import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import '../css/ProfilePage.css';

const ProfilePage = () => {
    const { id } = useParams();
    const [professional, setProfessional] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalImage, setModalImage] = useState(null);

    useEffect(() => {
        const fetchProfessional = async () => {
            try {
                const response = await fetch(
                    `http://localhost/Sal7ly/php_backend/profile.php?id=${id}`
                );
                const result = await response.json();

                if (result.error) {
                    console.error(result.error);
                    setProfessional(null);
                } else {
                    setProfessional(result.professional || null);
                }
            } catch (error) {
                console.error("Error fetching professional data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfessional();
    }, [id]);

    const openModal = (image) => {
        setModalImage(image);
    };

    const closeModal = () => {
        setModalImage(null);
    };

    if (loading) return <p className="profile-page__loading">Loading...</p>;
    if (!professional) return <p className="profile-page__error">Craftsman not found.</p>;

    return (
        <div className="profile-page">
            <div className="profile-page__main">
                <div className="profile-page__header">
                    <img
                        src={professional.picture}
                        alt={professional.name}
                        className="profile-page__picture"
                    />
                    <div className="profile-page__info">
                        <div className="profile-page__details">
                            <h1 className="profile-page__name">{professional.name}</h1>
                            <p className="profile-page__detail"><strong>City:</strong> {professional.city}</p>
                            <p className="profile-page__detail"><strong>Mobile:</strong> +{professional.mobile}</p>
                        </div>
                        <div className="profile-page__bio">
                            <h3 className="profile-page__bio-title">Bio:</h3>
                            <p
                                className="profile-page__bio-text"
                                dangerouslySetInnerHTML={{ __html: professional.bio.replace(/\n/g, "<br />") }}
                            />
                        </div>
                    </div>
                </div>

                <div className="profile-page__worksamples">
                    <h3 className="profile-page__worksamples-title">Work Samples:</h3>
                    {professional.worksamples.length > 0 ? (
                        <div className="profile-page__worksamples-grid">
                            {professional.worksamples.map((sample, index) => (
                                <img
                                    key={sample.id}
                                    src={sample.data}
                                    alt={`Sample ${index + 1}`}
                                    className="profile-page__worksample-image"
                                    onClick={() => openModal(sample.data)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="profile-page__empty-state">No work samples available.</p>
                    )}
                </div>
            </div>

            <div className="profile-page__reviews">
                <h3 className="profile-page__reviews-title">Ratings and Reviews:</h3>
                {professional.reviews.length > 0 ? (
                    <div className="profile-page__reviews-list">
                        {professional.reviews.map((review) => (
                            <div key={review.review_id} className="profile-page__review-card">
                                <div className="profile-page__review-header">
                                    <p className="profile-page__review-user"><strong>{review.user_name}</strong></p>
                                    <p className="profile-page__review-date">
                                        {new Date(review.created_at).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="profile-page__review-rating">
                                    {Array(5)
                                        .fill(0)
                                        .map((_, i) => (
                                            <span
                                                key={i}
                                                className={`profile-page__star ${i < review.rating ? "profile-page__star--filled" : "profile-page__star--empty"}`}
                                            >
                                                ★
                                            </span>
                                        ))
                                    }
                                </div>
                                {review.review_text && (
                                    <div className="profile-page__review-body">
                                        <p><strong>Comment:</strong> {review.review_text}</p>
                                    </div>
                                )}
                                <small className="profile-page__review-id">Request ID: {review.request_id}</small>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="profile-page__empty-state">No reviews available.</p>
                )}
            </div>

            {modalImage && (
                <div className="profile-page__modal" onClick={closeModal}>
                    <img src={modalImage} alt="Enlarged Work Sample" className="profile-page__modal-image" />
                    <button
                        className="profile-page__modal-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            closeModal();
                        }}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;