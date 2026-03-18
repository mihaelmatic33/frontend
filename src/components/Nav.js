import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../CartContext";
import "./nav.css";

const Nav = () => {
  const { cartItems } = useCart();
  const location = useLocation();
  const [name, setName] = useState(null);
  const [navOpacity, setNavOpacity] = useState(0);
  const [navBlend, setNavBlend] = useState(0);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const cartAnimationTimeoutRef = useRef(null);
  const previousCartCountRef = useRef(0);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState({
    categories: false,
    mystery: false,
  });
  const logoSrc = `${process.env.PUBLIC_URL}/img/pokestuff-logo-removebg-preview.png`;
  const userIconSrc = `${process.env.PUBLIC_URL}/img/header/user.svg`;
  const cartIconSrc = `${process.env.PUBLIC_URL}/img/header/cart.svg`;
  const isHomeRoute = location.pathname === "/";
  const searchParams = new URLSearchParams(location.search);
  const activeCategoryId = Number(searchParams.get("category"));
  const activeSubcategoryId = Number(searchParams.get("subcategory"));
  const isShopCategoriesRoute = location.pathname === "/shop-categories";

  const getCategoryItemClass = (categoryId) =>
    `dropdown-item nav__dropdown-item ${isShopCategoriesRoute && activeCategoryId === categoryId ? "active" : ""}`;

  const getMysteryItemClass = (subcategoryId) =>
    `dropdown-item nav__dropdown-item ${
      isShopCategoriesRoute &&
      activeCategoryId === 100 &&
      activeSubcategoryId === subcategoryId
        ? "active"
        : ""
    }`;

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) setName(user);
  }, []);

  useEffect(() => {
    setMobileDropdownOpen({ categories: false, mystery: false });
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isHomeRoute) {
      setNavOpacity(1);
      setNavBlend(1);
      return;
    }

    const updateNavOpacity = () => {
      const heroSection = document.querySelector(".home-epic__hero");
      const heroHeight = heroSection?.offsetHeight || window.innerHeight;
      const progress = Math.min(
        window.scrollY / Math.max(heroHeight * 0.92, 1),
        1,
      );
      setNavOpacity(progress);
      setNavBlend(progress);
    };

    updateNavOpacity();
    window.addEventListener("scroll", updateNavOpacity, { passive: true });
    window.addEventListener("resize", updateNavOpacity);

    return () => {
      window.removeEventListener("scroll", updateNavOpacity);
      window.removeEventListener("resize", updateNavOpacity);
    };
  }, [isHomeRoute]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setName(null);
  };

  const toggleMobileDropdown = (dropdownKey) => {
    if (window.innerWidth > 992) {
      return;
    }

    setMobileDropdownOpen((prev) => ({
      categories: dropdownKey === "categories" ? !prev.categories : false,
      mystery: dropdownKey === "mystery" ? !prev.mystery : false,
    }));
  };

  const navStyle = isHomeRoute
    ? {
        backgroundColor: `rgba(246, 224, 94, ${navOpacity})`,
        boxShadow: `0 4px 10px rgba(0, 0, 0, ${0.08 * navOpacity})`,
        backdropFilter: "blur(8px) saturate(130%)",
        WebkitBackdropFilter: "blur(8px) saturate(130%)",
        "--nav-link-color": `rgb(${Math.round(255 - 235 * navBlend)}, ${Math.round(
          255 - 233 * navBlend,
        )}, ${Math.round(255 - 234 * navBlend)})`,
      }
    : undefined;

  const cartCount = cartItems.reduce(
    (sum, item) => sum + Number(item?.quantity || 1),
    0,
  );

  const cartCountLabel = cartCount > 99 ? "99+" : String(cartCount);

  useEffect(() => {
    const previousCount = previousCartCountRef.current;
    if (cartCount > previousCount) {
      setIsCartAnimating(true);

      if (cartAnimationTimeoutRef.current) {
        clearTimeout(cartAnimationTimeoutRef.current);
      }

      cartAnimationTimeoutRef.current = setTimeout(() => {
        setIsCartAnimating(false);
      }, 560);
    }

    previousCartCountRef.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    return () => {
      if (cartAnimationTimeoutRef.current) {
        clearTimeout(cartAnimationTimeoutRef.current);
      }
    };
  }, []);

  if (location.pathname === "/signin" || location.pathname === "/register") {
    return null;
  }

  return (
    <>
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
              <li className="nav-item dropdown nav__item nav__item--dropdown">
                <div className="nav__dropdown-trigger">
                  <Link className="nav-link nav__link" to="/shop-categories">
                    SHOP
                  </Link>
                  <button
                    type="button"
                    className="nav__dropdown-toggle dropdown-toggle"
                    aria-expanded={mobileDropdownOpen.categories}
                    aria-label="Show Shop menu"
                    onClick={() => toggleMobileDropdown("categories")}
                  ></button>
                </div>

                <ul
                  className={`dropdown-menu nav__dropdown-menu ${mobileDropdownOpen.categories ? "show" : ""}`}
                >
                  <li>
                    <Link
                      className={getCategoryItemClass(100)}
                      to="/shop-categories?category=100"
                    >
                      Mystery
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getCategoryItemClass(95)}
                      to="/shop-categories?category=95"
                    >
                      Trading Card Game (TCG)
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getCategoryItemClass(98)}
                      to="/shop-categories?category=98"
                    >
                      Figures
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getCategoryItemClass(248)}
                      to="/shop-categories?category=248"
                    >
                      Video Games
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getCategoryItemClass(96)}
                      to="/shop-categories?category=96"
                    >
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

              <li className="nav-item dropdown nav__item nav__item--dropdown">
                <div className="nav__dropdown-trigger">
                  <Link className="nav-link nav__link" to="/mystery">
                    MYSTERIOUS POKESTUFF
                  </Link>
                  <button
                    type="button"
                    className="nav__dropdown-toggle dropdown-toggle"
                    aria-expanded={mobileDropdownOpen.mystery}
                    aria-label="Show Mysterious Pokestuff menu"
                    onClick={() => toggleMobileDropdown("mystery")}
                  ></button>
                </div>

                <ul
                  className={`dropdown-menu nav__dropdown-menu ${mobileDropdownOpen.mystery ? "show" : ""}`}
                >
                  <li>
                    <Link
                      className={getMysteryItemClass(140)}
                      to="/shop-categories?category=100&subcategory=140"
                    >
                      Mystery box
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getMysteryItemClass(137)}
                      to="/shop-categories?category=100&subcategory=137"
                    >
                      Mystery card
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getMysteryItemClass(138)}
                      to="/shop-categories?category=100&subcategory=138"
                    >
                      Mystery slab (graded card)
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getMysteryItemClass(139)}
                      to="/shop-categories?category=100&subcategory=139"
                    >
                      Mystery sealed (product)
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
                    Welcome, {name}
                  </button>
                ) : (
                  <Link
                    className="nav-link nav__link nav__link--icon"
                    to="/signin"
                    aria-label="Sign in"
                  >
                    <span
                      className="nav__icon nav__icon--user"
                      aria-hidden="true"
                      style={{ "--nav-icon-src": `url(${userIconSrc})` }}
                    />
                  </Link>
                )}
              </li>

              <li className="nav-item nav__item">
                <Link
                  className={`nav-link nav__link nav__link--icon nav__cart-link${
                    isCartAnimating ? " is-cart-added" : ""
                  }`}
                  to="/cart"
                  aria-label="Cart"
                >
                  <span
                    className="nav__icon nav__icon--cart"
                    aria-hidden="true"
                    style={{ "--nav-icon-src": `url(${cartIconSrc})` }}
                  />
                  {cartCount > 0 && (
                    <span className="nav__cart-badge">{cartCountLabel}</span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <Link
        to="/cart"
        className={`nav__floating-cart${isCartAnimating ? " is-cart-added" : ""}`}
        aria-label="Open cart"
      >
        <img src={cartIconSrc} alt="Cart" className="nav__floating-cart-icon" />
        {cartCount > 0 && (
          <span className="nav__cart-badge nav__cart-badge--floating">
            {cartCountLabel}
          </span>
        )}
      </Link>
    </>
  );
};

export default Nav;
