import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';

import { useState, useEffect } from "react";
import "./contact.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocation, faPhone } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { faInstagram, faLinkedin, faXTwitter } from "@fortawesome/free-brands-svg-icons";





const Contact = () => {

  const form = useRef();
  const [isSent, setIsSent] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm('service_dwhzjcu', 'template_882p0bt', form.current, {
        publicKey: 'St2MIqCGGqaIGQ1ND',
      })
      .then(
        () => {
          console.log('SUCCESS!');
          setIsSent(true);
        },
        (error) => {
          console.log('FAILED...', error.text);
        },
      );
  };
  





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
       <form ref={form} onSubmit={sendEmail} className='d-flex flex-column'>
                  <label>Name</label>
                  <input type="text" name="user_name" className='inputform' />
                  <label>Email</label>
                  <input type="email" name="user_email" className='inputform'  />
                  <label>Message</label>
                  <textarea rows={2} name="message" className='inputform'  />
                   <button type='submit' value="Send" className="button message-bttn mt-5 " disabled={isSent}>
                    {isSent ? "Message sent" : "Send Message"}
                   </button>
              </form>
        
        </div>
       
        
      </div>
      
    </div>
    </div>
    </>
    
  );
};

export default Contact;