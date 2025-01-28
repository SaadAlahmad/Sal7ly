import React, { useState } from "react";
import "../css/SupportPage.css";

const SupportPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage(null);

    try {
      const response = await fetch("http://localhost/Sal7ly/php_backend//supporthandler.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAlertType("success");
        setAlertMessage("Thank you! Your inquiry has been successfully sent, you will recieve from us soon.");
        setFormData({ name: "", email: "", message: "" });
        setIsModalOpen(false);
      } else {
        setAlertType("error");
        setAlertMessage(result.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setAlertType("error");
      setAlertMessage("Failed to send your inquiry. Please try again later.");
    }

    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  return (
    <div className="support-page">
      {alertMessage && (
        <div className={`alert alert--${alertType}`}>
          {alertMessage}
        </div>
      )}

      <header className="support-page__header">
        <h1 className="support-page__title">Support Center</h1>
        <p className="support-page__subtitle">
          We're here to help! Browse our FAQs or contact us directly.
        </p>
      </header>

      <div className="support-page__content">
        <section className="support-page__faq">
          <h2 className="support-page__section-title">Frequently Asked Questions</h2>
          <div className="support-page__faq-list">
            <article className="support-page__faq-item">
              <h3 className="support-page__faq-question">How can I create an account?</h3>
              <p className="support-page__faq-answer">
                Click on the "Get Started" button on the top-right corner and follow the instructions.
              </p>
            </article>
            <article className="support-page__faq-item">
              <h3 className="support-page__faq-question">How do I send a request?</h3>
              <p className="support-page__faq-answer">
                Go to the "Send a Request" page, fill out the form, and submit your request. (You need to be signed in)
              </p>
            </article>
            <article className="support-page__faq-item">
              <h3 className="support-page__faq-question">How can I browse the service providers?</h3>
              <p className="support-page__faq-answer">
                You can browse the categories on top of the page, select a service, and check the registered craftspeople, or by using the search page.
              </p>
            </article>
          </div>
        </section>

        <section className="support-page__contact">
          <h2 className="support-page__section-title">Contact Information</h2>
          <div className="support-page__contact-info">
            <ul className="support-page__contact-list">
              <li className="support-page__contact-item">
                <strong className="support-page__contact-label">Email:</strong> support@example.com
              </li>
              <li className="support-page__contact-item">
                <strong className="support-page__contact-label">Phone:</strong> +1 234 567 890
              </li>
              <li className="support-page__contact-item">
                <strong className="support-page__contact-label">Address:</strong> 123 Al-ersal, Ramallah, Palestine
              </li>
            </ul>
            <button
              className="support-page__contact-button"
              onClick={() => setIsModalOpen(true)}
            >
              Send Us a Message
            </button>
          </div>
        </section>

        <div
          className={`support-page__modal-overlay ${
            isModalOpen ? "support-page__modal-overlay--active" : ""
          }`}
        >
          <div className="support-page__modal">
            <header className="support-page__modal-header">
              <h2 className="support-page__modal-title">Send Us a Message</h2>
              <button
                className="support-page__modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </header>
            <form className="support-page__form" onSubmit={handleSubmit}>
              <div className="support-page__form-group">
                <input
                  className="support-page__form-input"
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="support-page__form-group">
                <input
                  className="support-page__form-input"
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="support-page__form-group">
                <textarea
                  className="support-page__form-textarea"
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="support-page__form-submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
