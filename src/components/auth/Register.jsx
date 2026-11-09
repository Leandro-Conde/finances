import { useState } from "react";
import { supabase } from "../../services/supabase";
import "../../styles/register.css";

function Register({ onBack }) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [receberNotificacoes, setReceberNotificacoes] = useState(false);
    const [loading, setLoading] = useState(false);

    async function register() {
        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim();

        if (!nomeLimpo) {
            alert("Informe seu nome.");
            return;
        }

        if (!/^[A-Z0-9._%+-]+@gmail\.com$/i.test(emailLimpo)) {
            alert("Utilize um endereço de email válido do Gmail (@gmail.com).");
            return;
        }

        if (password.length < 6) {
            alert("A senha precisa ter pelo menos 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            alert("As senhas não conferem.");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: emailLimpo,
                password,
                options: {
                    data: {
                        full_name: nomeLimpo,
                        nome: nomeLimpo,
                        receber_notificacoes: receberNotificacoes,
                    },
                },
            });

            if (error) {
                console.error("Erro no cadastro:", error);
                alert(error.message);
                return;
            }

            if (!data.user) {
                throw new Error("Não foi possível criar sua conta.");
            }

            if (data.session) {
                alert("Conta criada com sucesso!");
            } else {
                alert(
                    "Cadastro iniciado! Verifique sua caixa de entrada do Gmail para confirmar seu endereço antes de entrar."
                );
            }

            onBack();
        } catch (error) {
            console.error("Erro inesperado no cadastro:", error);
            alert(
                error.message ||
                "Não foi possível criar sua conta. Tente novamente."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="register-page">
            <div className="register-card">
                <h1>Criar Conta</h1>

                <p>
                    Crie sua conta no Atlas Finance.
                </p>

                <input
                    type="text"
                    placeholder="Nome"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    maxLength={80}
                    disabled={loading}
                    autoComplete="name"
                />

                <input
                    type="email"
                    placeholder="Email do Gmail"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                    autoComplete="email"
                />

                <label
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        margin: "8px 0 16px",
                        color: "#d4d4d8",
                        fontSize: "0.88rem",
                        lineHeight: 1.5,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={receberNotificacoes}
                        onChange={(event) =>
                            setReceberNotificacoes(event.target.checked)
                        }
                        disabled={loading}
                        style={{
                            width: "auto",
                            marginTop: "3px",
                            accentColor: "#8b5cf6",
                        }}
                    />

                    <span>
                        Quero receber notificações do Atlas Finance no meu Gmail.
                        <small
                            style={{
                                display: "block",
                                color: "#a1a1aa",
                                marginTop: "3px",
                            }}
                        >
                            Você poderá alterar essa preferência no seu perfil.
                        </small>
                    </span>
                </label>

                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                />

                <input
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                />

                <button
                    type="button"
                    onClick={register}
                    disabled={loading}
                >
                    {loading ? "Criando..." : "Criar Conta"}
                </button>

                <button
                    type="button"
                    className="register-back"
                    onClick={onBack}
                    disabled={loading}
                >
                    Voltar
                </button>
            </div>
        </div>
    );
}

export default Register;