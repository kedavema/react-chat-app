import React, { useState } from 'react';
import Perfil from "../img/perfil.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from '../firebase'
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { setDoc, doc } from "firebase/firestore"; 
import { Link, useNavigate } from 'react-router-dom';


const Register = () => {

  const [err, setErr] = useState(false);

  const navigate = useNavigate()

  const handleSubmit = async (e) => {

    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const storageRef = ref(storage, displayName);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          // Handle unsuccessful uploads
          setErr(true);
          console.log(err);
        }, 
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then( async (downloadURL) => {
            console.log('File available at', downloadURL);
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL
            });
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL
            });
            await setDoc(doc(db, "userChats", res.user.uid), {});
            navigate("/")
          });
        }
      );
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
        <span className="title">Registro</span>
        <form onSubmit={handleSubmit}>
          <input type="text" name="" id="" placeholder="Ingresa tu nombre" />
          <input type="email" name="" id="" placeholder="Correo" />
          <input type="password" name="" id="" placeholder="Contraseña" />
          <input style={{ display: "none" }} type="file" name="" id="file" />
          <label htmlFor="file">
            <img src={Perfil} alt="avatar" />
            <span>Subir un avatar</span>
          </label>
          <button>Registrarme</button>
          {err && <span>Something went wrong</span>}
        </form>
        <p>Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>.</p>
      </div>
    </div>
  </>
)
}

export default Register