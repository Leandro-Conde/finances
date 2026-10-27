
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
  onUsarValorGuardado,
  onEditarMeta,
  saldoBase = 0,
  investimentosBase = 0,
  financialDataLoaded = false,
}) {
  return (
    <section className="home">
      <div className="left-panel">
        
      <Dashboard
  transactions={transactions}
  allTransactions={allTransactions}
  goal={goal}
  limiteGastos={limiteGastos}
  onSalvarLimiteGastos={onSalvarLimiteGastos}
  onUsarValorGuardado={onUsarValorGuardado}
  saldoBase={saldoBase}
  investimentosBase={investimentosBase}
  financialDataLoaded={financialDataLoaded}
  onEditarMeta={onEditarMeta}
/>

      </div>

      <div className="right-panel">
        <FinanceChart
          transactions={transactions}
          allTransactions={allTransactions}
          loans={loans}
          scheduledBills={scheduledBills}
          limiteGastos={limiteGastos}
        />
      </div>
    </section>
  );
}

export default Home;
