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
                // console.log("Fetched work samples:", data);
                // console.log("WorkSamples Data:", workSamples);
            })
            .catch((error) => console.error("Error fetching work samples:", error));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setFadeClass("fade-image");
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
        return <div className="loading">جاري التحميل... / Loading...</div>;
    }

    return (
        <div className="homepage-container">
            <header className="homepage-header">
                <h1>مرحبًا بك في صلحلي / Welcome to Sal7ly</h1>
                <p>
                    منصة تجمع بين العملاء والمحترفين المهرة / A platform connecting customers with skilled professionals.
                </p>
                {!user && (
                    <div className="homepage-greeting-card">
                        <p>
                            مرحبًا! يرجى <Link to="/login">تسجيل الدخول</Link> أو <Link to="/signup">التسجيل</Link> لاستكشاف المزيد.
                            <br />
                            Hello! Please <Link to="/login">log in</Link> or <Link to="/signup">sign up</Link> to explore more.
                        </p>
                    </div>
                )}
                {user && <p className="homepage-greeting">مرحبًا، {user.name}! / Welcome back, {user.name}!</p>}
            </header>

            {user && user.userType === "craftsman" && (
                <section className="homepage-profile-card">
                    <Link to={`/profile/${user.id}`} className="profile-card">
                        <img
                            src={user.picture}
                            alt="صورة الملف الشخصي / Profile picture"
                            className="profile-card-image"
                        />
                        <div className="profile-card-info">
                            <h3>{user.name}</h3>
                            <p>
                                {user.category} - {user.city}
                            </p>
                        </div>
                    </Link>
                </section>
            )}

            {/* <section className="homepage-about">
                <h2>من نحن / About Us</h2>
                <p>
                    صلحلي هي منصة تربط العملاء مع المهنيين المهرة مثل السباكين، والنجارين، والحدادين، وغيرهم.
                    <br />
                    Sal7ly is a platform connecting customers with skilled professionals such as plumbers, carpenters, blacksmiths, and more.
                </p>
            </section> */}

            <section className="homepage-features">
            <h2>مميزاتنا / Our Features</h2>
            <div className="features-container">
                <div className="feature-item">
                <span className="feature-icon">✓</span>
                <p>بحث سهل الاستخدام / Easy-to-use search functionality</p>
                </div>
                <div className="feature-item">
                <span className="feature-icon">✓</span>
                <p>تصنيفات شاملة للمهارات والمهن / Comprehensive categories for various trades and skills</p>
                </div>
                <div className="feature-item">
                <span className="feature-icon">✓</span>
                <p>تصفية حسب المدينة للعثور على المهنيين بالقرب منك / City-based filtering for finding professionals near you</p>
                </div>
                <div className="feature-item">
                <span className="feature-icon">✓</span>
                <p>إرسال الطلبات بسهولة للحصول على خدمات مخصصة / Simple request submission for customized services</p>
                </div>
            </div>
            </section>

            {workSamples.length > 0 && (
                <section className="homepage-featured-worksample">
                    <div className="worksample-card">
                        <Link to={`/profile/${workSamples[currentSampleIndex].craftsperson_id}`}>
                            <div
                                className={`worksample-card-image ${fadeClass}`}
                                style={{
                                    backgroundImage: `url(data:${workSamples[currentSampleIndex].file_type};base64,${workSamples[currentSampleIndex].file_data})`,
                                }}
                            />
                            <div className="worksample-card-caption">
                                {workSamples[currentSampleIndex].craftsperson_name}
                            </div>
                        </Link>
                    </div>
                </section>
            )}

            <section className="homepage-cta">
                <h2>ابدأ اليوم / Get Started Today</h2>
                <p>
                    سواء كنت مهنيًا تتطلع إلى توسيع نطاق عملك أو عميلًا يبحث عن خدمات موثوقة، صلحلي هو الحل.
                    <br />
                    Whether you're a professional looking to expand your reach or a customer in need of reliable services, Sal7ly is the solution.
                </p>
                <div className="cta-buttons">
                    {user && user.userType === "craftsman" ? (
                        <Link to="/showrequests" className="homepage-button">
                            عرض الطلبات / Show Requests
                        </Link>
                    ) : (
                        <>
                            <Link to="/search" className="homepage-button">
                                ابحث عن المهنيين / Find Professionals
                            </Link>
                            <Link to="/request" className="homepage-button">
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
