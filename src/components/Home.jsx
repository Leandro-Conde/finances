import Dashboard from "./Dashboard";
import FinanceChart from "./Charts/FinanceChart";

import "../styles/home.css";

function Home({
  transactions,
  allTransactions,
  loans,
  scheduledBills,
  goal,
  limiteGastos,
  onSalvarLimiteGastos,
}) {
  return (
    <section className="home">
      <div className="left-panel">
        <Dashboard
          transactions={transactions}
          goal={goal}
          limiteGastos={limiteGastos}
          onSalvarLimiteGastos={onSalvarLimiteGastos}
        />
      </div>

      <div className="right-panel">
        <FinanceChart
          transactions={transactions}
          allTransactions={allTransactions}
          loans={loans}
          scheduledBills={scheduledBills}
        />
      </div>
    </section>
  );
}

export default Home;