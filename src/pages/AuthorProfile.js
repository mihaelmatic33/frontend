import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchJsonCached } from "../utils/httpCache";

const AuthorProfile = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let active = true;

    Promise.all([
      fetchJsonCached(
        `https://front2.edukacija.online/backend/wp-json/wp/v2/users/${id}`,
        {
          cacheKey: `author_profile_${id}`,
          ttlMs: 30 * 60 * 1000,
        },
      ),
      fetchJsonCached(
        `https://front2.edukacija.online/backend/wp-json/wp/v2/posts?author=${id}&_embed&per_page=100`,
        {
          cacheKey: `author_posts_${id}`,
          ttlMs: 5 * 60 * 1000,
        },
      ),
    ])
      .then(([authorData, postsData]) => {
        if (!active) return;

        setAuthor(authorData || null);
        setPosts(Array.isArray(postsData) ? postsData : []);
      })
      .catch(() => {
        if (!active) return;
        setAuthor(null);
        setPosts([]);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (!author) return <p>Loading autora...</p>;

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow mb-4">
        <h2>{author.name}</h2>
        <p className="text-muted">{author.description}</p>
      </div>

      <h4>Postovi autora:</h4>

      {posts.length === 0 && <p>Nema postova.</p>}

      {posts.map((post) => (
        <div key={post.id} className="card mb-3 shadow-sm">
          {(post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null) && (
            <img
              src={post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url}
              className="card-img-top"
              alt={post.title.rendered}
              loading="lazy"
              decoding="async"
            />
          )}
          <div className="card-body">
            <h5
              className="card-title"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
            <p
              className="card-text"
              dangerouslySetInnerHTML={{
                __html: post.excerpt
                  ? post.excerpt.rendered
                  : post.content.rendered.split("</p>")[0] + "</p>",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthorProfile;
