
import { useState } from "react";
import { supabase } from "../../services/supabase";
import Register from "./Register";
import Logo from "../common/Logo";

import "../../styles/login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    async function login() {
        if (!email.trim() || !password) {
            alert("Informe seu email e sua senha.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) {
                alert(error.message);
                return;
            }
        } catch (error) {
            console.error("Erro ao entrar:", error);
            alert("Não foi possível entrar. Verifique sua conexão.");
        } finally {
            setLoading(false);
        }
    }

    async function loginAsGuest() {
        if (loading) return;

        setLoading(true);

        try {
            const { error } = await supabase.auth.signInAnonymously();

            if (error) {
                console.error("Erro ao criar sessão de teste:", error);
                alert("Não foi possível iniciar a versão de teste. Tente novamente.");
                return;
            }
        } catch (error) {
            console.error("Erro inesperado na versão de teste:", error);
            alert("Ocorreu um erro ao iniciar a versão de teste.");
        } finally {
            setLoading(false);
        }
    }

    if (showRegister) {
        return <Register onBack={() => setShowRegister(false)} />;
    }

    return (
        <div className="login-page">
            <Logo variant="atlas" size={110} />

            <div className="login-card">
                <h1>Atlas Finance</h1>
                <p>Organize sua vida financeira.</p>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                />

                <button onClick={login} disabled={loading}>
                    {loading ? "Aguarde..." : "Entrar"}
                </button>

                <button
                    className="register"
                    onClick={() => setShowRegister(true)}
                    disabled={loading}
                >
                    Criar Conta
                </button>

                <button
                    type="button"
                    className="demo-login"
                    onClick={loginAsGuest}
                    disabled={loading}
                >
                    {loading ? "Iniciando..." : "Versão para teste"}
                </button>
            </div>
        </div>
    );
}

export default Login;
