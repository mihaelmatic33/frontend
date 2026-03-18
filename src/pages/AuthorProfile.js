import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const AuthorProfile = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`https://front2.edukacija.online/backend/wp-json/wp/v2/users/${id}`)
      .then(res => res.json())
      .then(data => setAuthor(data));
    fetch(`https://front2.edukacija.online/backend/wp-json/wp/v2/posts?author=${id}`)
      .then(res => res.json())
      .then(async data => {
        const postsWithImage = await Promise.all(
          data.map(async post => {
            if (post.featured_media) {
              const mediaRes = await fetch(`https://front2.edukacija.online/backend/wp-json/wp/v2/media/${post.featured_media}`);
              const mediaData = await mediaRes.json();
              post.featured_url = mediaData.source_url;
            } else {
              post.featured_url = null;
            }
            return post;
          })
        );
        setPosts(postsWithImage);
      });

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

      {posts.map(post => (
        <div key={post.id} className="card mb-3 shadow-sm">
          {post.featured_url && (
            <img src={post.featured_url} className="card-img-top" alt={post.title.rendered} />
          )}
          <div className="card-body">
            <h5 className="card-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
            <p className="card-text" dangerouslySetInnerHTML={{ __html: post.excerpt ? post.excerpt.rendered : post.content.rendered.split('</p>')[0] + '</p>' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthorProfile;