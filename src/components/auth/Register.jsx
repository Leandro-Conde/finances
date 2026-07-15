import { useState } from "react";
import { supabase } from "../../services/supabase";

import "../../styles/register.css";

function Register({ onBack }) {

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function register() {

        setLoading(true);

        if (!nome.trim()) {

            alert("Informe seu nome.");
            return;

        }

        if (password !== confirmPassword) {

            alert("As senhas não conferem.");
            return;

        }

        const { data, error } = await supabase.auth.signUp({

            email,
            password,

        });

        if (error) {

            alert(error.message);
            return;

        }

        if (data.user) {

            const { error: profileError } = await supabase

            .from("profiles")
        
            .insert({
        
                id: data.user.id,
        
                nome,
        
            });
        
        if (profileError) {
        
            console.error(profileError);
        
        }

        }

        alert("Conta criada com sucesso.");

        setLoading(false);

        onBack();

    }

    return (

        <div className="register-page">

            <div className="register-card">

                <h1>Criar Conta</h1>

                <p>

                    Crie sua conta no Atlas Finance.

                </p>

                <input

                    placeholder="Nome"

                    value={nome}

                    onChange={(e)=>setNome(e.target.value)}

                />

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

                <input

                    type="password"

                    placeholder="Confirmar senha"

                    value={confirmPassword}

                    onChange={(e)=>setConfirmPassword(e.target.value)}

                />

                <button
                    onClick={register}
                    disabled={loading}
                >

                    {loading ? "Criando..." : "Criar Conta"}

                </button>

                <button

                    className="register-back"

                    onClick={onBack}

                >

                    Voltar

                </button>

            </div>

        </div>

    );

}

export default Register;