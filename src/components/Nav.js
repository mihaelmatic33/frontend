import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./nav.css";

const Nav = () => {

  const location = useLocation();
  const [name, setName] = useState(null);
  useEffect(() => {
  const dropdowns = document.querySelectorAll('.nav-item.dropdown');

  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('.nav-link.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');

    link.addEventListener('click', (e) => {
      e.preventDefault(); // sprječava navigaciju
      menu.classList.toggle('show'); // toggle bootstrap dropdown
      if (menu.classList.contains('show')) {
        menu.style.maxHeight = menu.scrollHeight + "px";
      } else {
        menu.style.maxHeight = "0px";
      }
    });
  });
}, []);

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) setName(user);
  }, []);

  if (location.pathname === "/signin") {
    return null;
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setName(null);
  };

  return (
    <nav className="nav navbar navbar-expand-lg">

      <div className="container nav__container">

        {/* LOGO */}
        <Link className="navbar-brand nav__logo" to="/">
          <img
            src="img/pokestuff-logo-removebg-preview.png"
            alt="logo"
          />
        </Link>

        {/* MOBILE BUTTON */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">

          {/* LEFT MENU */}
          <ul className="navbar-nav me-auto nav__menu">

            {/* CATEGORIES */}
            <li className="nav-item dropdown nav__item">
              <Link
                className="nav-link dropdown-toggle nav__link"
                to="/categories"
                role="button"
                data-bs-toggle="dropdown"
              >
                CATEGORIES
              </Link>

              <ul className="dropdown-menu nav__dropdown-menu">
                <li>
                  <Link className="dropdown-item nav__dropdown-item" to="#">
                    Trading Card Game (TCG)
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item nav__dropdown-item" to="#">
                    Figures
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item nav__dropdown-item" to="#">
                    Video Games
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item nav__dropdown-item" to="#">
                    Accessories
                  </Link>
                </li>
              </ul>
            </li>

            {/* BLOG */}
            <li className="nav-item nav__item">
              <Link className="nav-link nav__link" to="/blog">
                BLOG
              </Link>
            </li>

            {/* KATEGORIJE */}
            <li className="nav-item nav__item">
              <Link className="nav-link nav__link" to="/kategorije">
                KATEGORIJE
              </Link>
            </li>

            {/* CONTACT */}
            <li className="nav-item nav__item">
              <Link className="nav-link nav__link" to="/contact">
                CONTACT
              </Link>
            </li>

            {/* MYSTERY */}
            <li className="nav-item dropdown nav__item">
              <Link
                className="nav-link dropdown-toggle nav__link"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                MYSTERIOUS POKESTUFF
              </Link>

              <ul className="dropdown-menu nav__dropdown-menu">
                <li>
                  <Link className="dropdown-item nav__dropdown-item" to="#">
                    Mystery pack
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item nav__dropdown-item" to="#">
                    Mystery slab
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item nav__dropdown-item" to="#">
                    Mystery box
                  </Link>
                </li>
              </ul>
            </li>

            {/* ADMIN */}
            {name && (
              <li className="nav-item nav__item">
                <Link className="nav-link nav__link nav__link--admin" to="/admin">
                  Admin
                </Link>
              </li>
            )}

          </ul>

          {/* RIGHT SIDE */}
          <ul className="navbar-nav nav__actions">

            {/* LOGIN */}
            <li className="nav-item nav__item">
              {name ? (
                <button onClick={logout} className="nav__login-btn">
                  Dobrodošli {name}
                </button>
              ) : (
                <Link className="nav-link nav__link" to="/signin">
                  <img
                    src="img/header/user.svg"
                    alt="Sign in"
                    className="nav__icon"
                  />
                </Link>
              )}
            </li>

            {/* CART */}
            <li className="nav-item nav__item">
              <Link className="nav-link nav__link" to="/cart">
                <img
                  src="img/header/cart.svg"
                  alt="Cart"
                  className="nav__icon nav__icon--cart"
                />
              </Link>
            </li>

          </ul>

        </div>
      </div>
    </nav>
  );
};

export default Nav;