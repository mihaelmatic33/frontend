import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


import Nav from "../components/Nav";
import Footer from "../components/Footer";
import BlogSingle from "./BlogSingle";
import posts from '../components/zadaci/data/blog.json' ;
import './Blog.css'
import Loader from '../components/Loader'
import ShopsSingle from "./ShopsSingle";



const Shops = () => {
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [shops,setShops] = useState([]);
  const [izabraniShop, setIzabraniShop] = useState("");

  useEffect(() => {
    fetch('https://front2.edukacija.online/backend/wp-json/wp/v2/prod-category')
    .then((response) => response.json())
    .then((data) => setShops(data))
  }, [])



  useEffect(
    () => {
      setLoading(true)

      let url = 'https://front2.edukacija.online/backend/wp-json/wp/v2/shop?_embed';
      if(izabraniShop) url += "&prod-category=" + izabraniShop;
      console.log(url)

      fetch(url)
      .then(response => response.json())
      .then(
        (data) => {
          setPosts(data);
        }
      )
      .finally(() => setLoading(false))
    }, [izabraniShop]
  )







  return (
   
 <>
        {loading && <Loader />}
        <div className="blog-page">
        <div className="container">
          <div className="row">
            <div className="col-6">
              <select className="form-select" value={izabraniShop} onChange={(e) => setIzabraniShop(e.target.value)}>
                <option value="">svi shopovi</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
            </div>
          </div>
        
          <div className="row">
          {posts.map((post) => {
            const image =
              post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes
                ?.full?.source_url;
            return (
              <div key={post.id} className="col-md-4 mb-4 blog-post">
                {image && (
                  <img src={image} className="mb-3" alt={post.title.rendered} />
                )}
                <Link to={'/shops/' + post.slug}>
                
                <h2>{post.title.rendered}</h2>
                
                </Link>
                <div
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                />
                <p>
                  {post._embedded?.author?.[0]?.name} |{" "}
                  {new Date(post.date).toLocaleDateString("hr-HR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            );
          })}
          
        </div>
        </div>
        </div>
        </>
        

  );
};

export default Shops;