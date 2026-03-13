import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./signin.css";

const SignIn = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://front2.edukacija.online/backend/wp-json/jwt-auth/v1/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();
      setLoading(false);

      if (data?.code) {
        setError("Wrong username or password");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user_display_name);

      navigate("/", { replace: true });
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-left">
        <Link to="/" className="signin-logo">
          <img
            src="img/pokestuff-logo-removebg-preview.png"
            alt="Pokestuff Logo"
          />
        </Link>
        <h1>Welcome to Pokestuff</h1>
      </div>

      <div className="signin-right">
        <h2>Sign In</h2>
        <p>Enter your credentials to access your account</p>

        <form className="signin-form" onSubmit={handleLogin}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Your username"
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Your password"
            required
          />

          <Link to="#" className="forgot-link">
            Forgot password?
          </Link>

          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>

          <Link to="/register" className="forgot-link register-link">
            You dont have account? Register here
          </Link>

          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignIn;
