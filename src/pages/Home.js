import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import FeaturedImg from "../components/FeaturedImg";
import HeroSection from "../components/HeroSection";

const Home = () => {

  const  [page, setPage] = useState(null);
  useEffect(() => {
    const fetchPage = async() => {
      try{
        const response = await fetch('https://front2.edukacija.online/backend/wp-json/wp/v2/pages/22?_embed');
        if(!response.ok){
          throw new Error('Ne mogu povući podatke');
        }
        const data = await response.json();
        setPage(data);

      }catch (err) {
        console.log(err.message);
      }
    }
    fetchPage();

    
  }, []);

  if(!page) return <p>Učitavanje...</p>

  return (
   <>
      <HeroSection 
      stranica={page}   
      fallback="https://placehold.co/600x400" 
      size="full"
      />
      {/*<FeaturedImg page={page} fallback="https://placehold.co/600x400" size="full"  /> */}
      <div dangerouslySetInnerHTML={{ __html:page.content.rendered }} />
    </>
   
  );
};

export default Home;
