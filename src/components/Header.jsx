import { supabase } from "../services/supabase";
import "../styles/header.css";

function Header() {

  async function logout() {

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      return;
    }

  }

  return (

    <header className="header">

      <h1>ATLAS FINANCE</h1>

      <div className="header-actions">

        <button
          className="logout-button"
          onClick={logout}
        >
          Sair
        </button>

      </div>

    </header>

  );

}

export default Header;