import React, { useRef, useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import "./contact.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocation,
  faPhone,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import {
  faInstagram,
  faLinkedin,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import SEO from "../components/SEO";

const Contact = () => {
  const form = useRef();
  const [isSent, setIsSent] = useState(false);
  const [yoast, setYoast] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutRef = useRef();

  // Auto-open and scroll when navigated via #about-us hash
  useEffect(() => {
    if (window.location.hash === "#about-us") {
      setAboutOpen(true);
      setTimeout(() => {
        aboutRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    }
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm("service_dwhzjcu", "template_882p0bt", form.current, {
        publicKey: "St2MIqCGGqaIGQ1ND",
      })
      .then(
        () => {
          console.log("SUCCESS!");
          setIsSent(true);
        },
        (error) => {
          console.log("FAILED...", error.text);
        },
      );
  };

  useEffect(() => {
    fetch("https://front2.edukacija.online/backend/wp-json/wp/v2/pages/617")
      .then((res) => res.json())
      .then((data) => {
        setYoast(data.yoast_head_json);
      });
  }, []);

  return (
    <>
      {yoast && (
        <SEO
          title={yoast.title}
          description={yoast.og_description || yoast.meta_description}
        />
      )}

      <div className="container contact-page">
        <div className="contact-head text-center">
          <h1 className="mt-3">Contact</h1>
          <p className="contact-subtitle">
            Any questions or remarks? Just write us a message.
          </p>
        </div>

        <div className="row contact-content g-4">
          <div className="col-md-4 left-part">
            <div className="naslov-lijevo">
              <h2>Contact Information</h2>
              <p>Feel free to contact us at any time.</p>
            </div>

            <div className="contact-links d-flex flex-column">
              <a href="tel:+10123456789" className="contact-item">
                <FontAwesomeIcon icon={faPhone} />
                <span>+1012 3456 789</span>
              </a>
              <a href="mailto:demo@gmail.com" className="contact-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>demo@gmail.com</span>
              </a>
              <a
                href="https://maps.google.com/?q=132+Ulica"
                className="contact-item"
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faLocation} />
                <span>132 Ulica, City</span>
              </a>
            </div>

            <div className="ikone">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                <FontAwesomeIcon icon={faXTwitter} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
            </div>
          </div>

          <div className="col-md-8 gap-5 d-flex flex-column">
            <div className="d-flex flex-column right-part">
              <form
                ref={form}
                onSubmit={sendEmail}
                className="d-flex flex-column"
              >
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  name="user_name"
                  className="inputform"
                  required
                />
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  name="user_email"
                  className="inputform"
                  required
                />
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  rows={4}
                  name="message"
                  className="inputform"
                  required
                />
                <button
                  type="submit"
                  value="Send"
                  className="button message-bttn"
                  disabled={isSent}
                >
                  {isSent ? "Message sent" : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── About Us accordion ── */}
      <div id="about-us" ref={aboutRef} className="about-accordion">
        <button
          type="button"
          className={`about-accordion__toggle${aboutOpen ? " open" : ""}`}
          onClick={() => setAboutOpen((prev) => !prev)}
          aria-expanded={aboutOpen}
        >
          <span>About Us</span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="about-accordion__chevron"
          />
        </button>

        <div className={`about-accordion__body${aboutOpen ? " open" : ""}`}>
          <div className="about-accordion__inner">
            <div className="about-accordion__grid">
              <div>
                <h3>Our Story</h3>
                <p>
                  Pokestuff was born out of a genuine passion for Pokemon
                  collecting. As collectors ourselves, we knew how difficult it
                  can be to find authentic, high-quality cards and products in
                  one place. That is why we built this store for collectors, by
                  collectors.
                </p>
                <p>
                  Our mission is simple: give you access to top-tier Pokemon
                  products with guaranteed authenticity, fast delivery, and
                  outstanding customer support.
                </p>
              </div>
              <div>
                <h3>What Makes Us Different?</h3>
                <ul className="about-accordion__list">
                  <li>
                    <strong>Authenticity</strong> - every product is verified
                    before shipping
                  </li>
                  <li>
                    <strong>Mystery Boxes</strong> - our exclusive mystery boxes
                    are carefully curated for every collector level
                  </li>
                  <li>
                    <strong>Graded Cards</strong> - we work with PSA and CGC
                    grading standards for certified cards
                  </li>
                  <li>
                    <strong>Community</strong> - follow us on social media and
                    join thousands of Pokemon enthusiasts
                  </li>
                </ul>
              </div>
            </div>

            <div className="about-accordion__stats">
              <div className="about-accordion__stat">
                <strong>500+</strong>
                <span>Happy Customers</span>
              </div>
              <div className="about-accordion__stat">
                <strong>1000+</strong>
                <span>Products Available</span>
              </div>
              <div className="about-accordion__stat">
                <strong>24/7</strong>
                <span>Online Availability</span>
              </div>
              <div className="about-accordion__stat">
                <strong>100%</strong>
                <span>Authenticity Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
