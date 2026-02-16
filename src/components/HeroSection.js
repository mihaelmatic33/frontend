const HeroSection = ({ stranica, fallback, size="full"}) => {

    const selectedImg= stranica?._embedded["wp:featuredmedia"]?.[0]?.media_details.sizes?.[size].source_url || fallback;
  return (
    <>
    <div className="container-fluid hero_section d-flex align-items-center justify-content-center" 
    style={{backgroundImage: `url(${selectedImg})`}}>
        <h1 className="text-center">{stranica?.acf?.naslov || "Stari naslov" } </h1>
    </div>
    </>
   
  )
}
export default HeroSection