import React, { useState } from 'react';
import '../css/SupportPage.css';

const SupportPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Thank you, ${formData.name}! Your message has been sent.`);
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="support-container">
            <h1 className="support-title">Support</h1>
            <div className="support-content">
                <div className="faq-section">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-item">
                        <h3>How can I create an account?</h3>
                        <p>Click on the "Get Started" button on the top-right corner and follow the instructions.</p>
                    </div>
                    <div className="faq-item">
                        <h3>How do I send a request?</h3>
                        <p>Go to the "Send a Request" page, fill out the form, and submit your request. (You need to be signed in)</p>
                    </div>
                    <div className="faq-item">
                        <h3>How can I contact a service provider?</h3>
                        <p>You can sign in, browse the categories, select a service, and directly contact the provider.</p>
                    </div>
                </div>

                <div className="contact-section">
                    <h2>Contact Us</h2>
                    <p>If you have further questions, feel free to reach out to us:</p>
                    <ul>
                        <li>Email: support@example.com</li>
                        <li>Phone: +1 234 567 890</li>
                        <li>Address: 123 Al-ersal, Ramallah, Palestine</li>
                    </ul>
                </div>

                <div className="support-form-section">
                    <h2>Send Us a Message</h2>
                    <form className="support-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <textarea
                            name="message"
                            placeholder="Your Message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                        />
                        <button type="submit" className="submit-button">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
