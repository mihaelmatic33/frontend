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
        
      </Routes>
      <Footer />
    </BrowserRouter>

  );
}

export default App;
