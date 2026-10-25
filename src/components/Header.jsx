
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "../styles/header.css";

const AVATAR_BUCKET = "avatars";
const SIGNED_URL_SECONDS = 60 * 60;

function Header({ onOpenProfile, onGoHome, currentPage = "home" }) {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAvatar() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        if (!cancelled) {
          setAvatarUrl("");
          setUserId("");
        }
        return;
      }

      const user = data.user;
      const avatarPath = user.user_metadata?.avatar_path;

      if (cancelled) return;

      setUserId(user.id);

      if (!avatarPath) {
        setAvatarUrl("");
        return;
      }

      const { data: signedData, error: signedError } =
        await supabase.storage
          .from(AVATAR_BUCKET)
          .createSignedUrl(avatarPath, SIGNED_URL_SECONDS);

      if (cancelled) return;

      if (signedError) {
        console.error("Erro ao carregar foto do perfil:", signedError);
        setAvatarUrl("");
        return;
      }

      setAvatarUrl(signedData?.signedUrl || "");
    }

    loadAvatar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        setAvatarUrl("");
        setUserId("");
      } else if (
        event === "SIGNED_IN" ||
        event === "USER_UPDATED"
      ) {
        loadAvatar();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erro ao sair:", error);
    }
  }

  return (
    <header className="header">
      <button
        className="header-brand"
        type="button"
        onClick={onGoHome}
        aria-label="Voltar ao Atlas Finance"
      >
        <img
          src={`${import.meta.env.BASE_URL}atlas-logo.png`}
          alt="Logo Atlas Finance"
          className="header-logo"
        />
        <h2>Atlas Finance</h2>
      </button>

      <div className="header-actions">
        <button
          className="profile-icon-button"
          type="button"
          onClick={currentPage === "profile" ? onGoHome : onOpenProfile}
          title={currentPage === "profile" ? "Voltar ao painel" : "Meu perfil"}
          aria-label={currentPage === "profile" ? "Voltar ao painel" : "Meu perfil"}
        >
          {currentPage === "profile" ? (
            "⌂"
          ) : avatarUrl ? (
            <img
              key={`${userId}-${avatarUrl}`}
              src={avatarUrl}
              alt="Minha foto de perfil"
              className="header-avatar"
            />
          ) : (
            "👤"
          )}
        </button>

        <button className="logout-button" onClick={logout} type="button">
          Sair
        </button>
      </div>
    </header>
  );
}

export default Header;
