import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


import Nav from "../components/Nav";
import Footer from "../components/Footer";
import BlogSingle from "./BlogSingle";
import posts from '../components/zadaci/data/blog.json' ;
import './Blog.css'
import Loader from '../components/Loader'

console.log(posts);

const Blog = () => {
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(
    () => {
      setLoading(true)
      fetch('https://front2.edukacija.online/backend/wp-json/wp/v2/posts?_embed')
      .then(response => response.json())
      .then(
        (data) => {
          setPosts(data);
        }
      )
      .finally(() => setLoading(false))
    }, []
  )







  return (
   
 <>
        {loading && <Loader />}
        <div className="blog-page">
        <div className="container">
        
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
                <h2>{post.title.rendered}</h2>
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

export default Blog;
