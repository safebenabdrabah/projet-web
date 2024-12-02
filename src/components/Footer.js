import React from "react";
import logo from "../images/logo.png" ;

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <img src={logo} alt="Logo" />
      </div>
      <div className="contact-info">
        <p>Contact Us : yallashop@gmail.com</p>
        <p>Phone : +216 ** *** ***</p>
      </div>
    </footer>
  );
}

export default Footer;