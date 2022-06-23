import React from "react";
import moment from "moment";
import Logo from "../assets/DOC_LOGO_SEAL.png";

const Header = () => {
  return (
    <>
      <nav className="navbar">
        <div className="container-fluid">
          <img width="75px" src={Logo} alt="Diocese of Camden" />
          <p className="navbar-brand">
            <i className="fas fa-asterisk"></i> Expiration Reminder
          </p>
          <div className="d-flex">
            <p>{moment().format("MMMM Do YYYY")}</p>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
