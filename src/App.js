import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './Gutenberg.css'
import './App.css';

import Nav from './components/Nav';
import Footer from './components/Footer';
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


function App() {
  return (

    <BrowserRouter>
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
        
        <Route path='/shops/:slug' element={<ShopsSingle />} />
        
      </Routes>
      <Footer />
    </BrowserRouter>

  );
}

export default App;
