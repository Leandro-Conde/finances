
import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import "../styles/header.css";

const AVATAR_BUCKET = "avatars";
const SIGNED_URL_SECONDS = 60 * 60;

const ACCESSIBILITY_DEFAULTS = {
  fontScale: "normal",
  highContrast: false,
  reducedMotion: false,
};

function readAccessibilitySettings() {
  try {
    const saved = localStorage.getItem("atlas-accessibility");

    if (!saved) return ACCESSIBILITY_DEFAULTS;

    return {
      ...ACCESSIBILITY_DEFAULTS,
      ...JSON.parse(saved),
    };
  } catch {
    return ACCESSIBILITY_DEFAULTS;
  }
}

function Header({ onOpenProfile, onGoHome, currentPage = "home" }) {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [accessibility, setAccessibility] = useState(
    readAccessibilitySettings
  );

  const accessibilityContainerRef = useRef(null);
  const accessibilityButtonRef = useRef(null);

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

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.fontScale = accessibility.fontScale;
    root.dataset.highContrast = String(accessibility.highContrast);
    root.dataset.reducedMotion = String(accessibility.reducedMotion);

    try {
      localStorage.setItem(
        "atlas-accessibility",
        JSON.stringify(accessibility)
      );
    } catch (error) {
      console.warn("Não foi possível salvar as preferências:", error);
    }
  }, [accessibility]);

  useEffect(() => {
    if (!accessibilityOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setAccessibilityOpen(false);
        accessibilityButtonRef.current?.focus();
      }
    }

    function handleOutsideClick(event) {
      if (
        accessibilityContainerRef.current &&
        !accessibilityContainerRef.current.contains(event.target)
      ) {
        setAccessibilityOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [accessibilityOpen]);

  function updateAccessibility(key, value) {
    setAccessibility((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function logout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const { data, error: userError } = await supabase.auth.getUser();

      if (userError || !data.user) {
        throw new Error(
          "Não foi possível identificar a conta autenticada."
        );
      }

      const user = data.user;

      // Conta de teste: excluir os dados antes de encerrar a sessão.
      if (user.is_anonymous === true) {
        const { error: cleanupError } =
          await supabase.functions.invoke("delete-demo-account");

        if (cleanupError) {
          console.error(
            "Erro ao excluir os dados da conta de teste:",
            cleanupError
          );

          throw new Error(
            "Não foi possível excluir os dados da versão de teste. Sua sessão continua ativa. Tente novamente."
          );
        }
      }

      // Conta real: apenas encerra a sessão.
      // Conta anônima: a identidade já foi excluída no servidor.
      // scope local limpa a sessão deste navegador.
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });

      if (signOutError) {
        throw signOutError;
      }

      setAvatarUrl("");
      setUserId("");
    } catch (error) {
      console.error("Erro ao sair:", error);

      window.alert(
        error.message ||
          "Não foi possível sair da conta. Tente novamente."
      );
    } finally {
      setIsLoggingOut(false);
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
          alt=""
          className="header-logo"
        />
        <h2>Atlas Finance</h2>
      </button>

      <div className="header-actions">
        <div
          className="accessibility-container"
          ref={accessibilityContainerRef}
        >
          <button
            ref={accessibilityButtonRef}
            className="accessibility-button"
            type="button"
            onClick={() => setAccessibilityOpen((open) => !open)}
            aria-label="Abrir painel de acessibilidade"
            aria-expanded={accessibilityOpen}
            aria-controls="accessibility-panel"
            title="Acessibilidade"
          >
            <span aria-hidden="true">♿</span>
          </button>

          {accessibilityOpen && (
            <section
              id="accessibility-panel"
              className="accessibility-panel"
              aria-label="Painel de acessibilidade"
            >
              <div className="accessibility-panel-header">
                <h3>Acessibilidade</h3>

                <button
                  type="button"
                  className="accessibility-close"
                  onClick={() => {
                    setAccessibilityOpen(false);
                    accessibilityButtonRef.current?.focus();
                  }}
                  aria-label="Fechar painel de acessibilidade"
                >
                  ×
                </button>
              </div>

              <p>
                Personalize sua experiência no Atlas Finance.
              </p>

              <fieldset className="accessibility-option">
                <legend>Tamanho do texto</legend>

                <div className="accessibility-control-row">
                  <button
                    type="button"
                    onClick={() =>
                      updateAccessibility(
                        "fontScale",
                        accessibility.fontScale === "larger"
                          ? "large"
                          : "normal"
                      )
                    }
                    disabled={accessibility.fontScale === "normal"}
                    aria-label="Diminuir tamanho do texto"
                  >
                    A−
                  </button>

                  <span aria-live="polite">
                    {accessibility.fontScale === "normal"
                      ? "Normal"
                      : accessibility.fontScale === "large"
                        ? "Grande"
                        : "Maior"}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateAccessibility(
                        "fontScale",
                        accessibility.fontScale === "normal"
                          ? "large"
                          : "larger"
                      )
                    }
                    disabled={accessibility.fontScale === "larger"}
                    aria-label="Aumentar tamanho do texto"
                  >
                    A+
                  </button>
                </div>
              </fieldset>

              <div className="accessibility-option">
                <div>
                  <strong>Alto contraste</strong>
                  <small>Reforça textos, bordas e controles.</small>
                </div>

                <button
                  type="button"
                  className="accessibility-switch"
                  role="switch"
                  aria-checked={accessibility.highContrast}
                  onClick={() =>
                    updateAccessibility(
                      "highContrast",
                      !accessibility.highContrast
                    )
                  }
                >
                  {accessibility.highContrast ? "Ativado" : "Desativado"}
                </button>
              </div>

              <div className="accessibility-option">
                <div>
                  <strong>Reduzir animações</strong>
                  <small>Reduz movimentos e transições da interface.</small>
                </div>

                <button
                  type="button"
                  className="accessibility-switch"
                  role="switch"
                  aria-checked={accessibility.reducedMotion}
                  onClick={() =>
                    updateAccessibility(
                      "reducedMotion",
                      !accessibility.reducedMotion
                    )
                  }
                >
                  {accessibility.reducedMotion
                    ? "Ativado"
                    : "Desativado"}
                </button>
              </div>

              <button
                type="button"
                className="accessibility-reset"
                onClick={() => setAccessibility(ACCESSIBILITY_DEFAULTS)}
              >
                Restaurar padrão
              </button>

              <p className="accessibility-keyboard-help">
                Dica: use Tab para navegar, Enter ou Espaço para ativar
                e Esc para fechar este painel.
              </p>
            </section>
          )}
        </div>

        <button
          className="profile-icon-button"
          type="button"
          onClick={currentPage === "profile" ? onGoHome : onOpenProfile}
          title={currentPage === "profile" ? "Voltar ao painel" : "Meu perfil"}
          aria-label={
            currentPage === "profile"
              ? "Voltar ao painel"
              : "Meu perfil"
          }
        >
          {currentPage === "profile" ? (
            "⌂"
          ) : avatarUrl ? (
            <img
              key={`${userId}-${avatarUrl}`}
              src={avatarUrl}
              alt=""
              className="header-avatar"
            />
          ) : (
            "👤"
          )}
        </button>

        <button
          className="logout-button"
          onClick={logout}
          type="button"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Saindo..." : "Sair"}
        </button>
      </div>
    </header>
  );
}

export default Header;
