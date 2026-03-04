import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './Gutenberg.css'
import './App.css';

import Nav from './components/Nav';
import Footer from './components/Footer';
import { CartProvider } from './CartContext';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Mystery from './pages/Mystery';
import Contact from './pages/Contact';
import Categories from './pages/Categories';
import BlogSingle from './pages/BlogSingle';
import Profil from "./components/zadaci/Profil";
import Profilil from './components/zadaci/Profilil';
import Tekstovi from './components/zadaci/Tekstovi';
import Tecaj from './components/zadaci/tecaj';
import Kategorije from './pages/Kategorije';
import Shops from './pages/Shops';
import ShopsSingle from './pages/ShopsSingle';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import Lokali from './pages/lokali';
import LokaliSingle from './pages/LokaliSingle';

import AdminLayout from './pages/admin/AdminLayout';
import MyDetails from './pages/admin/MyDetails';
import MySettings from './pages/admin/MySettings';
import MyPosts from './pages/admin/MyPosts';
import AuthorsPage from "./pages/AuthorsPage";
import AuthorProfile from "./pages/AuthorProfile";
import Checkout from './pages/shop/Checkout';
import Shop from './pages/shop/Shop';
import Cart from './pages/shop/Cart';


function App() {
  return (
    <CartProvider>
      <BrowserRouter basename={"/mmatic"}>
      <Nav />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/categories' element={<Categories />} />
          <Route path='/blog' element={<Blog />} />
          <Route path='/mystery' element={<Mystery />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/blog/:slug' element={<BlogSingle />} />
          <Route path='/kategorije' element={<Kategorije />} />
          <Route path='/profil' element={<Profil />} />
          <Route path='/profilil' element={<Profilil />} />
          <Route path='/tekstovi' element={<Tekstovi />} />
          <Route path='/tecaj' element={<Tecaj />} />
          <Route path='/shops' element={<Shops />} />
          <Route path='/signin' element={<SignIn />} />
          <Route path='/register' element={<Register />} />
          <Route path='/lokali' element={<Lokali />} />
          <Route path='/lokali/:slug' element={<LokaliSingle />} />
          
          
          <Route path='/shops/:slug' element={<ShopsSingle />} />
           <Route path="/autori" element={<AuthorsPage />} />
          <Route path="/autori/:id" element={<AuthorProfile />} />
          
          
      
      
          <Route path='/admin' element={<AdminLayout />} >
            <Route path='mydetails' element={<MyDetails />} />
            <Route path='myposts' element={<MyPosts />} />
            <Route path='mysettings' element={<MySettings />} />
          </Route>


          <Route path='/cart' element={<Cart />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/shop' element={<Shop />} />

         

          
        </Routes>
        <Footer />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
