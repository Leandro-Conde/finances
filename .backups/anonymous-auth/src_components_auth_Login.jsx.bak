import { useState } from "react";
import { supabase } from "../../services/supabase";
import Register from "./Register";
import Logo from "../common/Logo";

import "../../styles/login.css";
import BrandLogo from "../BrandLogo";



<BrandLogo
  type="atlas"
  size={90}
  className="auth-logo"
/>

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    async function login() {

        setLoading(true);
    
        const { error } = await supabase.auth.signInWithPassword({
    
            email,
            password,
    
        });
    
        setLoading(false);
    
        if (error) {
    
            alert(error.message);
            return;
    
        }
    
    }


    if (showRegister) {

        return (
    
            <Register
    
                onBack={() => setShowRegister(false)}
    
            />
    
        );
    
    }

    return (

        

        <div className="login-page">

                <Logo

                variant="atlas"

                size={110}

                />

            <div className="login-card">

                <h1>Atlas Finance</h1>

                <p>Organize sua vida financeira.</p>

                <input

                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}

                />

                <input

                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}

                />

                <button
                    onClick={login}
                    disabled={loading}
                >

                    {loading ? "Entrando..." : "Entrar"}

                </button>

                <button

                    className="register"

                    onClick={() => setShowRegister(true)}

                >

                    Criar Conta

                </button>

            </div>

        </div>

    );

}

export default Login;