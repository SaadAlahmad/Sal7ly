import React from "react";
import { Link } from 'react-router-dom'
import "../css/HomePage.css";

const HomePage = () => {
    return (
        <div className="homepage-container">
            <header className="homepage-header">
                <h1>Welcome to صلحلي</h1>
                <p>Your one-stop platform for finding skilled professionals and offering your services.</p>
            </header>

            <section className="homepage-about">
                <h2>About Us</h2>
                <p>
                    صلحلي is a platform designed to connect customers with skilled professionals such as plumbers, woodworkers, blacksmiths, and other tradespeople.
                    Whether you're looking for help with home repairs or want to showcase your services, صلحلي is here to make it easy.
                </p>
            </section>

            <section className="homepage-features">
                <h2>Our Features</h2>
                <ul>
                    <li>Easy-to-use search functionality</li>
                    <li>Comprehensive categories for various trades and skills</li>
                    <li>City-based filtering for finding professionals near you</li>
                    <li>Simple request submission for customized services</li>
                </ul>
            </section>

            <section className="homepage-cta">
                <h2>Get Started Today</h2>
                <p>
                    Whether you're a professional looking to expand your reach or a customer in need of reliable services, صلحلي is the solution.
                </p>
                <Link to="/search" className="homepage-button">Find Professionals</Link>
                <Link to="/request" className="homepage-button">Post a Request</Link>
            </section>
        </div>
    );
};

export default HomePage;
