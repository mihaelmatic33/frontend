import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./Gutenberg.css";
import "./App.css";

import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import ScrollToTop from "./components/ScrollToTop";
import { CartProvider } from "./CartContext";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Mystery from "./pages/Mystery";
import CustomMysteryBox from "./pages/CustomMysteryBox";
import Contact from "./pages/Contact";
import ShopCategories from "./pages/ShopCategories";
import BlogSingle from "./pages/BlogSingle";
import Shops from "./pages/Shops";
import ShopsSingle from "./pages/ShopsSingle";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import AdminLayout from "./pages/admin/AdminLayout";
import MyDetails from "./pages/admin/MyDetails";
import MySettings from "./pages/admin/MySettings";
import MyPosts from "./pages/admin/MyPosts";
import AuthorsPage from "./pages/AuthorsPage";
import AuthorProfile from "./pages/AuthorProfile";
import Checkout from "./pages/shop/Checkout";
import Cart from "./pages/shop/Cart";

const AppShell = () => {
  const location = useLocation();
  const [isRouteLoading, setIsRouteLoading] = useState(true);

  useEffect(() => {
    setIsRouteLoading(true);
    const timeoutId = setTimeout(() => {
      setIsRouteLoading(false);
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 220);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  if (isRouteLoading) {
    return <Loader />;
  }

  return (
    <div className="page-wrapper">
      <Nav />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop-categories" element={<ShopCategories />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/mystery" element={<Mystery />} />
          <Route path="/mystery/custom-box" element={<CustomMysteryBox />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog/:slug" element={<BlogSingle />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shops/:slug" element={<ShopsSingle />} />
          <Route path="/autori" element={<AuthorsPage />} />
          <Route path="/autori/:id" element={<AuthorProfile />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="mydetails" element={<MyDetails />} />
            <Route path="shophistory" element={<MyPosts />} />
            <Route path="mysettings" element={<MySettings />} />
          </Route>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/shop"
            element={<Navigate to="/shop-categories" replace />}
          />
        </Routes>
      </div>
      <ScrollToTop />
      <Footer />
    </div>
  );
};

function App() {
  const basename = process.env.PUBLIC_URL || "/";

  return (
    <CartProvider>
      <BrowserRouter basename={basename}>
        <AppShell />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
