import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import FeaturedImg from "../components/FeaturedImg";
import HeroSection from "../components/HeroSection";
import SEO from "../components/SEO";
const BASE_URL = process.env.REACT_APP_API_URL;
const Home = () => {

  const  [page, setPage] = useState(null);
  useEffect(() => {
    const fetchPage = async() => {
      try{
        const response = await fetch(`${BASE_URL}v2/pages/22?_embed`);
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
    <SEO
      title="Blog"
      description="Pročitaj najnovije članke o web developmentu, Reactu i modernim tehnologijama."
    />
      <HeroSection 
      stranica={page}   
      fallback="https://placehold.co/600x400" 
      size="full"
      />
      {}
      <div dangerouslySetInnerHTML={{ __html:page.content.rendered }} />

      <div className="data">
        {page.acf.adresa ? page.acf.adresa : "nema adrese"}
      </div>



    </>
   
  );
};

export default Home;
