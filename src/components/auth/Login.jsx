import { useState } from "react";
import { supabase } from "../../services/supabase";

import "../../styles/login.css";

function Login() {

    const [email,setEmail]=useState("");

    const [password,setPassword]=useState("");

    async function login(){

        const {error}=await supabase.auth.signInWithPassword({

            email,
            password,

        });

        if(error){

            alert(error.message);

        }

    }

    async function register(){

        const {error}=await supabase.auth.signUp({

            email,
            password,

        });

        if(error){

            alert(error.message);

        }

    }

    return(

        <div className="login-page">

            <div className="login-card">

                <h1>Atlas Finance</h1>

                <p>
                    Organize sua vida financeira.
                </p>

                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />

                <button onClick={login}>
                    Entrar
                </button>

                <button
                    className="register"
                    onClick={register}
                >
                    Criar Conta
                </button>

            </div>

        </div>

    );

}

export default Login;