import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faLinkedin,
  faXTwitter,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import "./footer.css";

// Theme options: footer--theme-a (current approved), footer--theme-b (new), footer--theme-c (old footer)
const FOOTER_THEME_CLASS = "footer--theme-b";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Subscribed with ${email}`);
      setEmail("");
    }
  };

  return (
    <footer className={`footer ${FOOTER_THEME_CLASS}`}>
      <div className="footer-container">
        <div className="footer-section footer-contact">
          <h3>Contact Us</h3>
          <p>Email: demo@gmail.com</p>
          <p>Phone: +1012 3456 789</p>
          <p>Address: 132 Ulica, City</p>
          <p>Open: 10:00 - 15:00</p>
        </div>

        <div className="footer-section footer-nav">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/shop-categories">Categories</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/signin">Sign In</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section footer-social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://x.com">
              <FontAwesomeIcon icon={faXTwitter} />
            </a>
            <a href="https://instagram.com">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://linkedin.com">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a href="https://facebook.com">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
          </div>
          <Link to="/contact#about-us" className="footer-about-link">
            About Us
          </Link>
        </div>

        <div className="footer-section footer-newsletter">
          <h3>Newsletter</h3>
          <p>Subscribe to our newsletter for latest updates</p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Pokestuff. All rights reserved. Designed with ❤️</p>
      </div>
    </footer>
  );
};

export default Footer;
