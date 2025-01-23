import React, { useState } from 'react';
import '../css/SupportPage.css';

const SupportPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Thank you, ${formData.name}! Your message has been sent.`);
        setFormData({ name: '', email: '', message: '' });
        setIsModalOpen(false); // Close modal after submission
    };

    return (
        <div className="support-page">
            <div className="support-header">
                <h1>Support Center</h1>
                <p>We're here to help! Browse our FAQs or contact us directly.</p>
            </div>

            <div className="support-content">
                <div className="faq-section">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-list">
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
                </div>

                <div className="contact-section">
                    <h2>Contact Information</h2>
                    <p>If you have further questions, feel free to reach out to us:</p>
                    <ul className="contact-info">
                        <li><strong>Email:</strong> support@example.com</li>
                        <li><strong>Phone:</strong> +1 234 567 890</li>
                        <li><strong>Address:</strong> 123 Al-ersal, Ramallah, Palestine</li>
                    </ul>
                    <button className="contact-button" onClick={() => setIsModalOpen(true)}>
                        Send Us a Message
                    </button>
                </div>
            </div>

            {/* Modal */}
            <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`}>
                <div className="modal">
                    <div className="modal-header">
                        <h2>Send Us a Message</h2>
                        <button className="close-button" onClick={() => setIsModalOpen(false)}>
                            &times;
                        </button>
                    </div>
                    <form className="support-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                name="message"
                                placeholder="Your Message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-button">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;