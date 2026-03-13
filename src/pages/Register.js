import "./register.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_URL;
const Register = () => {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}v2/users`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      setLoading(false);
      console.log(data);
      if (data?.code) {
        setError("Wrong Email or password");
        return;
      }

      navigate("/signin", { replace: true });
    } catch (error) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <Link to="/" className="register-logo">
          <img
            src={`${process.env.PUBLIC_URL}/img/pokestuff-logo-removebg-preview.png`}
            alt="Pokestuff Logo"
          />
        </Link>
        <h1>Become a collector</h1>
      </div>

      <div className="register-right">
        <div className="register-panel">
          <h2>Create account</h2>
          <p>Join Pokestuff and start building your collection.</p>

          <form onSubmit={handleRegister} className="register-form">
            <label htmlFor="username">Choose your username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Your username"
              required
            />

            <label htmlFor="email">Enter your email address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your email"
              required
            />

            <label htmlFor="password">Create password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              required
            />

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Creating account..." : "Register now"}
            </button>

            <Link to="/signin" className="register-link">
              Already have an account? Sign in here
            </Link>

            {error && <p className="register-error">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
