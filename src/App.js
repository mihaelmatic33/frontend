import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';

import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Shop from './pages/Shop';
import Contact from './pages/Contact';
import Categories from './pages/Categories';
import BlogSingle from './pages/BlogSingle';
import Profil from "./components/zadaci/Profil";
import Profilil from './components/zadaci/Profilil';
import Tekstovi from './components/zadaci/Tekstovi';
import Tecaj from './components/zadaci/tecaj';


function App() {
  return (

    <BrowserRouter>
    <Nav />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/categories' element={<Categories />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/shop' element={<Shop />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/blogsingle' element={<BlogSingle />} />
        <Route path='/profil' element={<Profil />} />
        <Route path='/profilil' element={<Profilil />} />
        <Route path='/tekstovi' element={<Tekstovi />} />
        <Route path='/tecaj' element={<Tecaj />} />
        
      </Routes>
      <Footer />
    </BrowserRouter>

  );
}

export default App;
