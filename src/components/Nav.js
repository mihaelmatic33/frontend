import { Link, useLocation } from "react-router-dom"



const Nav = () => {

  const location = useLocation();

  if (location.pathname === "/signin")


  return (
     <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <Link className="navbar-brand" to="/index.html">
            <img src="img/header/logo.svg" alt="logo" height="12" />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="true"
            aria-label="toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="navbar-collapse collapse" id="mainNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item dropdown text-end">
                <Link
                  className="nav-link dropdown-toggle"
                  to="/categories"
                  id="ddElectric"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  CATEGORIES
                </Link>
                <ul className="dropdown-menu" aria-labelledby="ddElectric">
                  <li>
                    <Link className="dropdown-item text-end" to="#">
                      Trading Card game(TCG)
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item text-end" to="#">
                      Figures
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item text-end" to="#">
                      Video Games
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item text-end" to="#">
                      Accesories
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="nav-item dropdown text-end">
                <Link
                  className="nav-link dropdown-toggle"
                  to="/shop"
                  id="ddElectric"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  SHOP
                </Link>
                <ul className="dropdown-menu" aria-labelledby="ddElectric">
                  <li>
                    <Link className="dropdown-item text-end" to="#">
                      Caféracer
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item text-end" to="#">
                      Robyn
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="nav-item dropdown text-end">
                <Link
                  className="nav-link dropdown-toggle"
                  to="#"
                  id="ddElectric"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  BLOG
                </Link>
                <ul className="dropdown-menu" aria-labelledby="ddElectric">
                  <li>
                    <Link className="dropdown-item text-end" to="#">
                      El Bear
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item text-end" to="#">
                      El Robin
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-end" to="/blog">
                  BLOG
                </Link></li>
                <li className="nav-item">
                <Link className="nav-link text-end" to="/kategorije">
                  KATEGORIJE
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-end" to="/contact">
                  CONTACT
                </Link>
              </li>
              <li className="nav-item dropdown text-end">
                <Link
                  className="nav-link dropdown-toggle"
                  to="#"
                  id="ddElectric"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  MYSTERIOUS POKESTUFF
                </Link>
                <ul className="dropdown-menu" aria-labelledby="ddElectric">
                  <li>
                    <Link className="dropdown-item text-end" to="#">
                      Mystery pack
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item text-end" to="#">
                      Mystery slab
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item text-end" to="#">
                      Mystery box
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>

            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link className="nav-link" to="/signin" title="Sign in">
                  <img
                    src="img/header/user.svg"
                    alt="Sign in"
                    className="icon-sm"
                  />
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/cart" title="Cart">
                  <img src="img/header/cart.svg" alt="Cart" className="icon-lg" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
  )
}

export default Nav