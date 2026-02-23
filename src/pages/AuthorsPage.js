import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


const AuthorsPage = () => {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    fetch("https://front2.edukacija.online/backend/wp-json/wp/v2/users")
      .then(res => res.json())
      .then(data => setAuthors(data));
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Naši Autori</h1>

      <div className="row">
        {authors.map(author => (
          <div key={author.id} className="col-md-4 mb-4">
            <Link 
              to={`/autori/${author.id}`} 
              className="text-decoration-none text-dark"
            >
              <div className="card shadow-sm p-3">
                <h5>{author.name}</h5>
                <p>{author.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthorsPage;