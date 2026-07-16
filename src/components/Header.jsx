import { supabase } from "../services/supabase";
import "../styles/header.css";
import Logo from "./common/Logo";

function Header() {

  async function logout() {

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      return;
    }

  }

  <div className="header-brand">

  <Logo

      variant="atlas"

      size={42}

  />

  <h2>

      Atlas Finance

  </h2>

</div>

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