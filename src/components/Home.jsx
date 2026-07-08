import Dashboard from "./Dashboard";
import FinanceChart from "./charts/FinanceChart";

import "../styles/home.css";

function Home({ transactions }) {
  return (
    <section className="home">

      <div className="left-panel">
        <Dashboard
          transactions={transactions}
        />
      </div>

      <div className="right-panel">
        <FinanceChart
          transactions={transactions}
        />
      </div>

    </section>
  );
}

export default Home;