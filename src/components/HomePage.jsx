import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/HomePage.css";
import { UserContext } from "./UserContext";

const HomePage = () => {
    const { user, loading } = useContext(UserContext);
    const [workSamples, setWorkSamples] = useState([]);
    const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
    const [fadeClass, setFadeClass] = useState("");

    useEffect(() => {
        fetch("http://localhost/Sal7ly/php_backend/homepagesamples.php")
            .then((response) => response.json())
            .then((data) => {
                setWorkSamples(data.workSamples);
            })
            .catch((error) => console.error("Error fetching work samples:", error));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setFadeClass("home-page__worksample-image--fade");
            setTimeout(() => {
                setCurrentSampleIndex((prevIndex) =>
                    workSamples.length > 0 ? (prevIndex + 1) % workSamples.length : 0
                );
                setFadeClass("");
            }, 1000);
        }, 5000);

        return () => clearInterval(interval);
    }, [workSamples]);

    if (loading) {
        return <div className="home-page__loading">جاري التحميل... / Loading...</div>;
    }

    return (
        <div className="home-page">
            <header className="home-page__header">
                <h1 className="home-page__title">مرحبًا بك في صلحلي / Welcome to Sal7ly</h1>
                <p className="home-page__subtitle">
                    منصة تجمع بين العملاء والمحترفين المهرة / A platform connecting customers with skilled professionals.
                </p>
                {!user && (
                    <div className="home-page__greeting-card">
                        <p className="home-page__greeting-text">
                            مرحبًا! يرجى <Link to="/login" className="home-page__link">تسجيل الدخول</Link> أو <Link to="/signup" className="home-page__link">التسجيل</Link> لاستكشاف المزيد.
                            <br />
                            Hello! Please <Link to="/login" className="home-page__link">log in</Link> or <Link to="/signup" className="home-page__link">sign up</Link> to explore more.
                        </p>
                    </div>
                )}
                {user && <p className="home-page__greeting">مرحبًا، {user.name}! / Welcome back, {user.name}!</p>}
            </header>

            {user && user.userType === "craftsman" && (
                <section className="home-page__profile-section">
                    <Link to={`/profile/${user.id}`} className="home-page__profile-card">
                        <img
                            src={user.picture}
                            alt="صورة الملف الشخصي / Profile picture"
                            className="home-page__profile-image"
                        />
                        <div className="home-page__profile-info">
                            <h3 className="home-page__profile-name">{user.name}</h3>
                            <p className="home-page__profile-details">
                                {user.category} - {user.city}
                            </p>
                        </div>
                    </Link>
                </section>
            )}

            <section className="home-page__features">
                <h2 className="home-page__features-title">مميزاتنا / Our Features</h2>
                <div className="home-page__features-grid">
                    <div className="home-page__feature-item">
                        <span className="home-page__feature-icon">✓</span>
                        <p className="home-page__feature-text">بحث سهل الاستخدام / Easy-to-use search functionality</p>
                    </div>
                    <div className="home-page__feature-item">
                        <span className="home-page__feature-icon">✓</span>
                        <p className="home-page__feature-text">تصنيفات شاملة للمهارات والمهن / Comprehensive categories for various trades and skills</p>
                    </div>
                    <div className="home-page__feature-item">
                        <span className="home-page__feature-icon">✓</span>
                        <p className="home-page__feature-text">تصفية حسب المدينة للعثور على المهنيين بالقرب منك / City-based filtering for finding professionals near you</p>
                    </div>
                    <div className="home-page__feature-item">
                        <span className="home-page__feature-icon">✓</span>
                        <p className="home-page__feature-text">إرسال الطلبات بسهولة للحصول على خدمات مخصصة / Simple request submission for customized services</p>
                    </div>
                </div>
            </section>

            {workSamples.length > 0 && (
                <section className="home-page__worksample-section">
                    <div className="home-page__worksample-card">
                        <Link to={`/profile/${workSamples[currentSampleIndex].craftsperson_id}`}>
                            <div
                                className={`home-page__worksample-image ${fadeClass}`}
                                style={{
                                    backgroundImage: `url(data:${workSamples[currentSampleIndex].file_type};base64,${workSamples[currentSampleIndex].file_data})`,
                                }}
                            />
                            <div className="home-page__worksample-caption">
                                {workSamples[currentSampleIndex].craftsperson_name}
                            </div>
                        </Link>
                    </div>
                </section>
            )}

            <section className="home-page__cta">
                <h2 className="home-page__cta-title">ابدأ اليوم / Get Started Today</h2>
                <p className="home-page__cta-text">
                    سواء كنت مهنيًا تتطلع إلى توسيع نطاق عملك أو عميلًا يبحث عن خدمات موثوقة، صلحلي هو الحل.
                    <br />
                    Whether you're a professional looking to expand your reach or a customer in need of reliable services, Sal7ly is the solution.
                </p>
                <div className="home-page__cta-buttons">
                    {user && user.userType === "craftsman" ? (
                        <Link to="/showrequests" className="home-page__cta-button">
                            عرض الطلبات / Show Requests
                        </Link>
                    ) : (
                        <>
                            <Link to="/search" className="home-page__cta-button">
                                ابحث عن المهنيين / Find Professionals
                            </Link>
                            <Link to="/request" className="home-page__cta-button">
                                أرسل طلبًا / Post a Request
                            </Link>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;