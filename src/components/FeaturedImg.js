const FeaturedImg = ({ post,  size="full", fallback }) => {
    const selectedImg = post?._embedded["wp:featuredmedia"]?.[0]?.media_details.sizes?.[size].source_url || fallback
    console.log(post)
  return (
    <>
        <img src={selectedImg} className="hero_img" />
        
    </>
  )
}
export default FeaturedImg