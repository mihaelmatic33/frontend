const Author = ({ post, author=true }) => {
  return (
    <span class="meta">
      {author ? "Author:" : ""}
      <a href="#!">{post._embedded.author[0].name}</a>
      {author ?  ", " : "|"}
      {new Date(post.date).toLocaleDateString("hr-HR")}
    </span>
  );
};
export default Author;
