import { useState, useEffect } from "react";


import Nav from "../components/Nav";
import Footer from "../components/Footer";
import BlogSingle from "./BlogSingle";
import posts from '../components/zadaci/data/blog.json' ;
import './Blog.css'

console.log(posts);

const Blog = () => {
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(
    () => {
      fetch('https://front2.edukacija.online/backend/wp-json/wp/v2/posts?_embed')
      .then(response => response.json())
      .then(
        (data) => {
          setPosts(data);
        }
      )
    }, []
  )







  return (
    

        <div className="blog-page">
        <div className="container">
        
          <div className="row">
            {posts.map((post) => (
              <div className="col-md-4 blog-post">
                <img src={post._embedded["wp:featuredmedia"][0].media_details.sizes.full.source_url} />
                <h2>{post.title.rendered}</h2>
                 <div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}></div>
                 {post._embedded.author[0].name}
                 <p>{new Date(post._embedded["wp:featuredmedia"][0].date).toLocaleDateString('hr-HR')}</p>

                </div>

            ) )
            }
          
        </div>
        </div>
        </div>
        

  );
};

export default Blog;
