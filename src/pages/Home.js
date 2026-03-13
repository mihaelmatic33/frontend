import { useState, useEffect } from "react";
import HeroSection from "../components/HeroSection";
import SEO from "../components/SEO";
const BASE_URL = process.env.REACT_APP_API_URL;

const removeLegacyHeroSection = (content = "") => {
  if (!content) return "";

  return content.replace(
    /<section[^>]*class=["'][^"']*\bhero\b[^"']*["'][^>]*>[\s\S]*?<\/section>/gi,
    "",
  );
};

const Home = () => {
  const [page, setPage] = useState(null);
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`${BASE_URL}v2/pages/22?_embed`);
        if (!response.ok) {
          throw new Error("Ne mogu povući podatke");
        }
        const data = await response.json();
        setPage(data);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchPage();
  }, []);

  if (!page) return <p>Učitavanje...</p>;

  const contentWithoutLegacyHero = removeLegacyHeroSection(
    page.content.rendered,
  );

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
      <div dangerouslySetInnerHTML={{ __html: contentWithoutLegacyHero }} />

      <div className="data">
        {page.acf.adresa ? page.acf.adresa : "nema adrese"}
      </div>
    </>
  );
};

export default Home;
