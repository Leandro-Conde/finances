import { calculateDashboardMetrics } from "../utils/dashboardMetrics";
import MetricCard from "./cards/MetricCard";
import ProgressBar from "./dashboard/ProgressBar";

function Dashboard({
    transactions,
    monthlyGoal,
}) {


  const {
    saldo,
    entradas,
    saidas,
    investimentos,
    rendaPassiva,
    economia,
    tetoGastos,
    percentualGasto,
  } = calculateDashboardMetrics(transactions);

  return (

    <section className="dashboard">
    
        <div className="saldo-card">
    
            <h2>Saldo Atual</h2>
    
            <h1>
                {saldo.toLocaleString("pt-BR",{
                    style:"currency",
                    currency:"BRL",
                })}
            </h1>
    
        </div>
    
        <div className="metrics-grid">
    
            <MetricCard
                titulo="Entradas"
                valor={entradas}
            />
    
            <MetricCard
                titulo="Saídas"
                valor={saidas}
            />
    
            <MetricCard
                titulo="Investimentos"
                valor={investimentos}
            />
    
            <MetricCard
                titulo="Renda Passiva"
                valor={rendaPassiva}
            />
    
            <MetricCard
                titulo="Economia"
                valor={economia}
            />
    
            <MetricCard
                titulo="Teto"
                valor={saidas}
            >
                <small>
                    {percentualGasto.toFixed(0)}% utilizado
                </small>
            </MetricCard>
    
        </div>
    
    </section>
    
    );

  }

  export default Dashboard; 