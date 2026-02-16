const FeaturedImg = ({ page, size="full", fallback }) => {
    const selectedImg = page?._embedded["wp:featuredmedia"]?.[0]?.media_details.sizes?.[size].source_url || fallback
  return (
    <>
        <img src={selectedImg} className="hero_img" />
    </>
  )
}
export default FeaturedImg