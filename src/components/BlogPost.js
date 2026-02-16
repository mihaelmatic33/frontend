import { Link } from "react-router-dom";
import Author from "./Author";
const BlogPost = ({ post }) => {
  const image =
    post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.full
      ?.source_url;
  return (
    <div key={post.id} className="col-md-4 mb-4 blog-post">
      {image && (
        <Link to={"/blog/" + post.slug}>
          <img src={image} className="mb-3" alt={post.title.rendered} />
        </Link>
      )}
      <Link to={"/blog/" + post.slug}>
        <h2>{post.title.rendered}</h2>
      </Link>
      <div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
      <Author post={post} author={false} />
    </div>
  );
};
export default BlogPost;