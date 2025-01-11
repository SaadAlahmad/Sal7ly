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

    if (loading) return <p className="loadingp">Loading...</p>;
    if (!professional) return <p>craftsman not found.</p>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <img src={professional.picture} alt={professional.name} className="profile-picture" />
                <div className="profile-main">
                    <div className="profile-details">
                        <h1>{professional.name}</h1>
                        <p><strong>City:</strong> {professional.city}</p>
                        <p><strong>Mobile:</strong> +{professional.mobile}</p>
                    </div>
                    <div className="profile-bio">
                        <h3>Bio:</h3>
                        <p dangerouslySetInnerHTML={{ __html: professional.bio.replace(/\n/g, "<br />") }} />
                    </div>
                </div>
            </div>
            <div className="profile-worksamples">
                <h3>Work Samples:</h3>
                {professional.worksamples.length > 0 ? (
                    <div className="worksamples-grid">
                        {professional.worksamples.map((sample, index) => (
                            <img
                                key={sample.id}
                                src={sample.data}
                                alt={`Sample ${index + 1}`}
                                className="work-sample-image"
                                onClick={() => openModal(sample.data)}
                            />
                        ))}
                    </div>
                ) : (
                    <p>No work samples available.</p>
                )}
            </div>
            {modalImage && (
                <div className="image-modal" onClick={closeModal}>
                    <img src={modalImage} alt="Enlarged Work Sample" />
                    <button className="close-button" onClick={(e) => {
                        e.stopPropagation();
                        closeModal();
                    }}>×</button>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
