import { useState } from "react";
import { supabase } from "../../services/supabase";

import "../../styles/login.css";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

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

    async function register() {

        setLoading(true);
    
        const { error } = await supabase.auth.signUp({
    
            email,
            password,
    
        });
    
        if (error) {
    
            setLoading(false);
            alert(error.message);
            return;
    
        }
    
        const { error: loginError } =
            await supabase.auth.signInWithPassword({
    
                email,
                password,
    
            });
    
        setLoading(false);
    
        if (loginError) {
    
            alert(loginError.message);
            return;
    
        }
    
    }

    return (

        <div className="login-page">

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
                    onClick={register}
                    disabled={loading}
                >

                    {loading ? "Criando..." : "Criar Conta"}

                </button>

            </div>

        </div>

    );

}

export default Login;