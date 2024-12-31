import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import '../css/ProfilePage.css';

const ProfilePage = () => {
    const { id } = useParams(); // Get the professional ID from the URL
    const [professional, setProfessional] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfessional = async () => {
            try {
                const response = await fetch(
                    `http://localhost/test-project/test-project/php_backend/profile.php?id=${id}`
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
              <p><strong>Mobile:</strong> 0{professional.mobile}</p>
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
            <ul>
              {professional.worksamples.map((sample, index) => (
                <li key={index}>
                  <a href={sample} target="_blank" rel="noopener noreferrer">
                    View Sample {index + 1}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No work samples available.</p>
          )}
        </div>
      </div>
    );
};

export default ProfilePage;
