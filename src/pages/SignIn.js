import { useState } from "react";
import "./signin.css";
import { Link } from "react-router-dom";

const SignIn = () => {

    const [error,setError] = useState("");
    const [loading, setLoading] = useState(false);


    const [form, setForm] = useState({
        username: "",
        password: "",
    })

    const handleChange = (e) =>{
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }
    const handleLogin = async(e) => {
        e.prevent.default()
        setLoading(true)
        
        try {
      const response = await fetch(
        "https://front2.edukacija.online/backend/wp-json/jwt-auth/v1/token",
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();
      setLoading(false);
      console.log(data);
      if (data?.code) {
        setError("Wrong Email or password");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user_display_name);

      //window.location.reload()
    } catch (error) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
      console.error(error);
    }
  };

   
  return (
  
   <div className="container">
    <div className="row my-3">
        
       
        <div className="col-md-6 profile-left">
            <h1>Welcome</h1>
            <img src="/img/header/logo_light.svg" alt="" />
        </div>
        <div className="col-md-6 profile-right">
            <div>
            <h2>Sign in</h2>
            <p>Nekakav bzvz tekst</p>
            <form onSubmit={handleLogin} className="signing-form">
                <label htmlFor="">
                    Username
                </label>
                <input 
                type="text" 
                name="username"
                value={form.username}
                onChange={handleChange}
                
                />
                <label htmlFor="">
                    Password
                </label>
                <input 
                type="password" 
                name="password"
                value={form.password}
                onChange={handleChange}
                 />
                <a href="#">Forgot password?</a>
                <button type="submit" className="btn buton-right">Log in</button>
                
                <p>{error}</p>
            </form>
</div>
        </div>
         </div>
    </div>
  
  );
};

export default SignIn;
