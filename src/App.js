import { Suspense, lazy, useEffect, useState } from "react";
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
const Home = lazy(() => import("./pages/Home"));
const Blog = lazy(() => import("./pages/Blog"));
const Mystery = lazy(() => import("./pages/Mystery"));
const CustomMysteryBox = lazy(() => import("./pages/CustomMysteryBox"));
const Contact = lazy(() => import("./pages/Contact"));
const ShopCategories = lazy(() => import("./pages/ShopCategories"));
const BlogSingle = lazy(() => import("./pages/BlogSingle"));
const ShopsSingle = lazy(() => import("./pages/ShopsSingle"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Register = lazy(() => import("./pages/Register"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const MyDetails = lazy(() => import("./pages/admin/MyDetails"));
const MySettings = lazy(() => import("./pages/admin/MySettings"));
const MyPosts = lazy(() => import("./pages/admin/MyPosts"));
const AuthorsPage = lazy(() => import("./pages/AuthorsPage"));
const AuthorProfile = lazy(() => import("./pages/AuthorProfile"));
const Checkout = lazy(() => import("./pages/shop/Checkout"));
const Cart = lazy(() => import("./pages/shop/Cart"));
const ROUTE_LOADER_MIN_MS = 120;

const AppShell = () => {
  const location = useLocation();
  const [isRouteLoading, setIsRouteLoading] = useState(true);

  useEffect(() => {
    setIsRouteLoading(true);

    const timeoutId = setTimeout(() => {
      setIsRouteLoading(false);
      window.scrollTo({ top: 0, behavior: "auto" });
    }, ROUTE_LOADER_MIN_MS);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  if (isRouteLoading) {
    return <Loader />;
  }

  return (
    <div className="page-wrapper">
      <Nav />
      <div className="content">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop-categories" element={<ShopCategories />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/mystery" element={<Mystery />} />
            <Route path="/mystery/custom-box" element={<CustomMysteryBox />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog/:slug" element={<BlogSingle />} />
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
        </Suspense>
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
