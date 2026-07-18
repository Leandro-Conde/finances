import { calculateDashboardMetrics } from "../utils/dashboardMetrics";
import MetricCard from "./cards/MetricCard";
import ProgressBar from "./dashboard/ProgressBar";
import { getDashboardInsights } from "../utils/dashboardInsights";

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

  const insights = getDashboardInsights(transactions);

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
            titulo="Saldo Atual"
            valor={saldo}
            delay={0}
        />

            <MetricCard
                titulo="Entradas"
                valor={entradas}
                insight={insights.entrada}
                delay={120}
            />

            <MetricCard
                titulo="Saídas"
                valor={saidas}
                insight={insights.saida}
                delay={240}
            />

            <MetricCard
                titulo="Investimentos"
                valor={investimentos}
                insight={insights.investimento}
                delay={360}
            />

        <MetricCard
            titulo="Renda Passiva"
            valor={rendaPassiva}
            delay={480}
        />

        <MetricCard
            titulo="Economia"
            valor={economia}
            delay={600}
        />

    
            <MetricCard
                titulo="Teto de Gastos"
                valor={tetoGastos}
                delay={600}
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