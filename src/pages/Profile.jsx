
import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import "../styles/profile.css";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

function Profile() {
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [nome, setNome] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tema, setTema] = useState("dark");
  const [idioma, setIdioma] = useState("pt-BR");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setErrorMessage("Não foi possível carregar sua conta.");
        setLoading(false);
        return;
      }

      const currentUser = data.user;
      const metadata = currentUser.user_metadata || {};

      setUser(currentUser);
      setNome(metadata.full_name || metadata.name || "");
      setAvatarUrl(metadata.avatar_url || "");

      try {
        const savedTheme = localStorage.getItem("atlas-theme");
        const savedLanguage = localStorage.getItem("atlas-language");

        if (["dark", "light", "system"].includes(savedTheme)) {
          setTema(savedTheme);
        }

        if (["pt-BR", "en", "es"].includes(savedLanguage)) {
          setIdioma(savedLanguage);
        }
      } catch {
        // As preferências continuam disponíveis durante a sessão.
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  function clearMessages() {
    setMessage("");
    setErrorMessage("");
  }

  async function saveProfile(event) {
    event.preventDefault();
    clearMessages();

    if (!user) return;

    if (!nome.trim()) {
      setErrorMessage("Informe seu nome.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        full_name: nome.trim(),
        avatar_url: avatarUrl || null,
      },
    });

    setSaving(false);

    if (error) {
      setErrorMessage(`Não foi possível salvar: ${error.message}`);
      return;
    }

    setUser(data.user);
    setMessage("Informações do perfil salvas com sucesso.");
  }

  async function uploadAvatar(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !user) return;

    clearMessages();

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Selecione uma imagem JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setErrorMessage("A imagem deve ter no máximo 2 MB.");
      return;
    }

    setUploading(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "png";
      const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(filePath);

      const newAvatarUrl = data.publicUrl;

      const { data: updatedData, error: updateError } =
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            full_name: nome.trim(),
            avatar_url: newAvatarUrl,
          },
        });

      if (updateError) throw updateError;

      setUser(updatedData.user);
      setAvatarUrl(newAvatarUrl);
      setMessage("Foto de perfil atualizada.");
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Não foi possível enviar a foto. Verifique o armazenamento do Supabase."
      );
    } finally {
      setUploading(false);
    }
  }

  async function removeAvatar() {
    clearMessages();

    if (!user) return;

    setSaving(true);

    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        full_name: nome.trim(),
        avatar_url: null,
      },
    });

    setSaving(false);

    if (error) {
      setErrorMessage(`Não foi possível remover a foto: ${error.message}`);
      return;
    }

    setUser(data.user);
    setAvatarUrl("");
    setMessage("Foto personalizada removida.");
  }

  function savePreferences(nextTheme = tema, nextLanguage = idioma) {
    clearMessages();

    try {
      localStorage.setItem("atlas-theme", nextTheme);
      localStorage.setItem("atlas-language", nextLanguage);

      setTema(nextTheme);
      setIdioma(nextLanguage);

      setMessage("Preferências salvas neste navegador.");
    } catch {
      setErrorMessage("Não foi possível salvar as preferências.");
    }
  }

  async function resetPassword() {
    clearMessages();

    if (!user?.email) {
      setErrorMessage("Não encontramos um e-mail para esta conta.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      user.email,
      {
        redirectTo: `${window.location.origin}/`,
      }
    );

    if (error) {
      setErrorMessage(`Não foi possível enviar o e-mail: ${error.message}`);
      return;
    }

    setMessage("Se o serviço estiver configurado, você receberá um e-mail para redefinir sua senha.");
  }

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">Carregando perfil...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          {errorMessage || "Faça login para acessar seu perfil."}
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-heading">
        <h2>Perfil e Configurações</h2>
        <p>
          Gerencie suas informações e preferências do Atlas Finance.
        </p>
      </div>

      {message && (
        <div className="profile-message success" role="status">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="profile-message error" role="alert">
          {errorMessage}
        </div>
      )}

      <section className="profile-card avatar-card">
        <div className="profile-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Foto de perfil" />
          ) : (
            <div className="profile-avatar-placeholder">
              <span>💜</span>
            </div>
          )}
        </div>

        <div className="avatar-content">
          <h3>Foto do perfil</h3>
          <p>Esta foto será exibida no seu perfil.</p>

          <div className="avatar-actions">
            <button
              className="profile-primary-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Enviando..." : "↑ Alterar foto"}
            </button>

            <button
              className="profile-secondary-button"
              type="button"
              onClick={removeAvatar}
              disabled={!avatarUrl || saving || uploading}
            >
              Remover foto
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={uploadAvatar}
              hidden
            />
          </div>

          <p className="profile-help">
            Formatos aceitos: JPG, PNG ou WEBP. Tamanho máximo: 2 MB.
          </p>
        </div>
      </section>

      <form onSubmit={saveProfile}>
        <section className="profile-card">
          <div className="profile-section-heading">
            <h3>Informações pessoais</h3>
            <p>Seus dados básicos de identificação.</p>
          </div>

          <div className="profile-fields">
            <label className="profile-field">
              <span>Nome</span>
              <input
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Seu nome"
                maxLength={80}
                required
              />
            </label>

            <label className="profile-field">
              <span>E-mail</span>
              <input
                type="email"
                value={user.email || ""}
                readOnly
                disabled
              />
              <small>
                O e-mail está vinculado à sua conta de autenticação.
              </small>
            </label>
          </div>

          <div className="profile-form-actions">
            <button
              className="profile-primary-button"
              type="submit"
              disabled={saving || uploading}
            >
              {saving ? "Salvando..." : "✓ Salvar alterações"}
            </button>
          </div>
        </section>
      </form>

      <section className="profile-card">
        <div className="profile-section-heading">
          <h3>Preferências</h3>
          <p>Personalize sua experiência no Atlas Finance.</p>
        </div>

        <div className="profile-preference">
          <div>
            <strong>Tema</strong>
            <p>Escolha a aparência da aplicação.</p>
          </div>

          <div className="profile-segmented-control">
            {[
              { value: "dark", label: "Escuro" },
              { value: "light", label: "Claro" },
              { value: "system", label: "Sistema" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={tema === option.value ? "active" : ""}
                aria-pressed={tema === option.value}
                onClick={() => savePreferences(option.value, idioma)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="profile-preference">
          <div>
            <strong>Idioma</strong>
            <p>Selecione o idioma de sua preferência.</p>
          </div>

          <select
            value={idioma}
            onChange={(event) =>
              savePreferences(tema, event.target.value)
            }
            aria-label="Idioma da aplicação"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </section>

      <section className="profile-card">
        <div className="profile-section-heading">
          <h3>Segurança</h3>
          <p>Gerencie o acesso à sua conta.</p>
        </div>

        <div className="profile-security-row">
          <div>
            <strong>Alterar senha</strong>
            <p>Receba um e-mail para redefinir sua senha.</p>
          </div>

          <button
            className="profile-secondary-button"
            type="button"
            onClick={resetPassword}
          >
            ↗ Redefinir senha
          </button>
        </div>
      </section>
    </main>
  );
}

export default Profile;
