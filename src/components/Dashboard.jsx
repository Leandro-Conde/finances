import { calculateDashboardMetrics } from "../utils/dashboardMetrics";
import MetricCard from "./cards/MetricCard";
import ProgressBar from "./dashboard/ProgressBar";
import { getDashboardInsights } from "../utils/dashboardInsights";

function Dashboard({
    transactions,
    goal,
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

  const valorAtualMeta =
    Number(goal?.valor_inicial || 0) + investimentos;

const percentualMeta = goal?.valor_meta
    ? Math.min(
        (valorAtualMeta / Number(goal.valor_meta)) * 100,
        100
      )
    : 0;

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
        {goal && (
    <div className="goal-dashboard-card">

        <div className="goal-dashboard-header">

            <h3>🎯 {goal.nome}</h3>

            <strong>
                {percentualMeta.toFixed(0)}%
            </strong>

        </div>

        <p>
            {valorAtualMeta.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
            })}

            {" de "}

            {Number(goal.valor_meta).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
            })}
        </p>

        <div className="goal-bar">

            <div
                className="goal-progress"
                style={{
                    width: `${percentualMeta}%`,
                }}
            />

        </div>

    </div>
)}
    
    </section>
    
    );

  }

  export default Dashboard; 