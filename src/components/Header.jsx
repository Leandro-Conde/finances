
import { supabase } from "../services/supabase";
import "../styles/header.css";
import Logo from "./common/Logo";

function Header({ onOpenProfile, onGoHome, currentPage = "home" }) {
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
        <Logo variant="atlas" size={42} />
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
          {currentPage === "profile" ? "⌂" : "👤"}
        </button>

        <button className="logout-button" onClick={logout} type="button">
          Sair
        </button>
      </div>
    </header>
  );
}

export default Header;
