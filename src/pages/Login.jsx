import React, { useState } from 'react'
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase'
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {

  const [err, setErr] = useState(false);

  const navigate = useNavigate ()

  const handleSubmit = async (e) => {

    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/")
    } catch (err) {
      console.log(err);
      setErr(true);
    }
  }

  return (
    <>
      <div className="formContainer">
        <div className="formWrapper">
          <span className="logo">Chat with React</span>
          <span className="title">Login</span>
          <form onSubmit={handleSubmit}>
            <input type="email" name="" id="" placeholder="Correo" />
            <input type="password" name="" id="" placeholder="Contraseña" />
            <button>Iniciar sesión</button>
          </form>
          <p>Aun no tienes una cuenta? <Link to="/register">Regístrate</Link>.</p>
          {err && <span>Something went wrong</span>}
          </div>
      </div>
    </>
  )
}

export default Login