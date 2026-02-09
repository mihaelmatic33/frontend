import './register.css';
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";



const Register = () => {
    const navigate = useNavigate();

    const [error,setError] = useState("");
    const [loading, setLoading] = useState(false);


    const [form, setForm] = useState({
        username: "",
        password: "",
        email: ""
    })
    
     useEffect(() => {
    const token = localStorage.getItem("token");
        if (token) {
        navigate("/", { replace: true });
        }
        }, [navigate]);

    const handleChange = (e) =>{
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }
    const handleRegister = async(e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
      const response = await fetch(
        "https://front2.edukacija.online/backend/wp/v2/users",
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
      

      navigate("/signin", {replace: true});
      

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
            <h1>Become a member</h1>
            <img src="/img/header/logo_light.svg" alt="" />
        </div>
        <div className="col-md-6 profile-right">
            <div>
            <h2>Register here</h2>
            <p>For better expirience</p>
            <form onSubmit={handleRegister} className="signing-form">
                <label htmlFor="">
                    Choose your Username:
                </label>
                <input 
                type="text" 
                name="username"
                value={form.username}
                onChange={handleChange}
                
                />
                <label htmlFor="">
                    Enter your email address:
                </label>
                <input 
                type="email" 
                name="email"
                value={form.email}
                onChange={handleChange}
                
                />

                <label htmlFor="">
                    Create Password:
                </label>
                <input 
                type="password" 
                name="password"
                value={form.password}
                onChange={handleChange}
                 />

                
                
                <button type="submit" className="btn register-btn">Register now</button>
                
                <p>{error}</p>
            </form>
</div>
        </div>
         </div>
    </div>
  
  );
};

export default Register;
