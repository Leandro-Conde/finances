import Dashboard from "./Dashboard";
import FinanceChart from "./Charts/FinanceChart";

import "../styles/home.css";

function Home({ transactions, goal }) {
  return (
    
    <section className="home">

      <div className="left-panel">
       <Dashboard
      transactions={transactions}
      goal={goal}
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