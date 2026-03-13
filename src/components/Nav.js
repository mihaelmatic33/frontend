import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./nav.css";

const Nav = () => {
  const location = useLocation();
  const [name, setName] = useState(null);
  const [navOpacity, setNavOpacity] = useState(1);
  const logoSrc = `${process.env.PUBLIC_URL}/img/pokestuff-logo-removebg-preview.png`;
  const userIconSrc = `${process.env.PUBLIC_URL}/img/header/user.svg`;
  const cartIconSrc = `${process.env.PUBLIC_URL}/img/header/cart.svg`;
  const isHomeRoute = location.pathname === "/";

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) setName(user);
  }, []);

  useEffect(() => {
    if (!isHomeRoute) {
      setNavOpacity(1);
      return;
    }

    const updateNavOpacity = () => {
      const heroSection = document.querySelector(".hero_section");
      const heroHeight = heroSection?.offsetHeight || window.innerHeight;
      const progress = Math.min(window.scrollY / heroHeight, 1);
      setNavOpacity(progress);
    };

    updateNavOpacity();
    window.addEventListener("scroll", updateNavOpacity, { passive: true });
    window.addEventListener("resize", updateNavOpacity);

    return () => {
      window.removeEventListener("scroll", updateNavOpacity);
      window.removeEventListener("resize", updateNavOpacity);
    };
  }, [isHomeRoute]);

  if (location.pathname === "/signin" || location.pathname === "/register") {
    return null;
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setName(null);
  };

  const navStyle = isHomeRoute
    ? {
        backgroundColor: `rgba(246, 224, 94, ${navOpacity})`,
        boxShadow: `0 4px 10px rgba(0, 0, 0, ${0.08 * navOpacity})`,
      }
    : undefined;

  return (
    <nav
      className={`nav navbar navbar-expand-lg ${isHomeRoute ? "nav--overlay" : ""}`}
      style={navStyle}
    >
      <div className="container nav__container">
        <Link className="navbar-brand nav__logo" to="/">
          <img src={logoSrc} alt="logo" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto nav__menu">
            <li className="nav-item dropdown nav__item">
              <Link
                className="nav-link dropdown-toggle nav__link"
                to="/shop-categories"
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

            {}
            <li className="nav-item nav__item">
              <Link className="nav-link nav__link" to="/blog">
                BLOG
              </Link>
            </li>

            <li className="nav-item nav__item">
              <Link className="nav-link nav__link" to="/contact">
                CONTACT
              </Link>
            </li>

            <li className="nav-item dropdown nav__item">
              <Link
                className="nav-link dropdown-toggle nav__link"
                to="/mystery"
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

            {name && (
              <li className="nav-item nav__item">
                <Link
                  className="nav-link nav__link nav__link--admin"
                  to="/admin"
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav nav__actions">
            <li className="nav-item nav__item">
              {name ? (
                <button onClick={logout} className="nav__login-btn">
                  Dobrodošli {name}
                </button>
              ) : (
                <Link className="nav-link nav__link" to="/signin">
                  <img src={userIconSrc} alt="Sign in" className="nav__icon" />
                </Link>
              )}
            </li>

            <li className="nav-item nav__item">
              <Link className="nav-link nav__link" to="/cart">
                <img
                  src={cartIconSrc}
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
