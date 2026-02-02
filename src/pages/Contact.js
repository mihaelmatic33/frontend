import { useState, useEffect } from "react";
import "./contact.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocation, faPhone } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { faInstagram, faLinkedin, faXTwitter } from "@fortawesome/free-brands-svg-icons";





const Contact = () => {
  





  return (
    <>
    <div className="container">
      <div className="row my-4 ">
        
        <h1 className="text-center mt-3">Contact</h1>
          <p className="text-center">Any questions or remarks? Just write us a message</p>
          <div className="col-md-4 left-part">
            <div className="naslov-lijevo">
            <h2 className="text-left">Contact Information</h2>
            <p className="text-left">Say something to start a live chat!</p>
          </div>

         
          <div className="d-flex flex-column">
            <a href=""><span> <FontAwesomeIcon icon={faPhone} /> +1012 3456  789</span></a>
            <a href=""><span> <FontAwesomeIcon icon={faEnvelope} />  demo@gmail.com</span></a>
            <a href=""><span> <FontAwesomeIcon icon={faLocation} />  132 ulica ulica i koji grad</span></a>

          </div>
          <div className="ikone">
          <a href="www.x.com"><FontAwesomeIcon icon={faXTwitter} /></a>
          <a href="www.instagram.com"><FontAwesomeIcon icon={faInstagram} /></a>
          <a href="www.linkedin.com"><FontAwesomeIcon icon={faLinkedin} /></a>
          </div>
           </div>


      
      <div className="col-md-8 gap-5 d-flex flex-column">
        <div className="d-flex flex-column right-part">
        <label htmlFor="name">First name</label>
        <input type="text" />
        <label htmlFor="email">Email</label>
        <input type="text" />
        <label htmlFor="message">Message</label>
        <textarea></textarea>
        
        </div>
        <button className="button message-bttn">Send Message</button>
        
      </div>
      
    </div>
    </div>
    </>
    
  );
};

export default Contact;