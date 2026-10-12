
import { useEffect, useState } from "react";
import { calculateDashboardMetrics } from "../utils/dashboardMetrics";
import MetricCard from "./cards/metricCard";
import { getDashboardInsights } from "../utils/dashboardInsights";

function Dashboard({
    transactions = [],
    goal,
    limiteGastos = 3000,
    onSalvarLimiteGastos,
}) {
    const [modalAberto, setModalAberto] = useState(false);
    const [novoLimite, setNovoLimite] = useState(String(limiteGastos));
    const [erro, setErro] = useState("");

    useEffect(() => {
        setNovoLimite(String(limiteGastos));
    }, [limiteGastos]);

    const {
        saldo,
        entradas,
        saidas,
        investimentos,
        rendaPassiva,
        economia,
        tetoGastos,
        percentualGasto,
    } = calculateDashboardMetrics(transactions, limiteGastos);

    const insights = getDashboardInsights(transactions);

    const valorAtualMeta =
        Number(goal?.valor_inicial || 0) + investimentos;

    const percentualMeta = goal?.valor_meta
        ? Math.min(
            (valorAtualMeta / Number(goal.valor_meta)) * 100,
            100
        )
        : 0;

    const formatarMoeda = (valor) =>
        Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });

    async function salvarLimite(event) {
        event.preventDefault();

        const valor = Number(novoLimite.replace(",", "."));

        if (!Number.isFinite(valor) || valor <= 0) {
            setErro("Informe um limite maior que zero.");
            return;
        }

        if (typeof onSalvarLimiteGastos !== "function") {
            setErro("A função de salvamento ainda não foi conectada.");
            return;
        }

        try {
            setErro("");
            await onSalvarLimiteGastos(valor);
            setModalAberto(false);
        } catch (error) {
            console.error("Erro ao salvar limite de gastos:", error);
            setErro("Não foi possível salvar. Tente novamente.");
        }
    }

    return (
        <section className="dashboard">
            <div className="saldo-card">
                <h2>Saldo Atual</h2>
                <h1>{formatarMoeda(saldo)}</h1>
            </div>

            <div className="metrics-grid">
                <MetricCard titulo="Saldo Atual" valor={saldo} delay={0} />

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
                    delay={720}
                >
                    <small>
                        {percentualGasto.toFixed(0)}% utilizado
                    </small>

                    <button
                        type="button"
                        onClick={() => {
                            setNovoLimite(String(limiteGastos));
                            setErro("");
                            setModalAberto(true);
                        }}
                        style={{
                            display: "block",
                            marginTop: 8,
                            padding: "6px 10px",
                            background: "#27272a",
                            color: "#fff",
                            border: "1px solid #52525b",
                            borderRadius: 8,
                            cursor: "pointer",
                        }}
                    >
                        Alterar limite
                    </button>
                </MetricCard>
            </div>

            {goal && (
                <div className="goal-dashboard-card">
                    <div className="goal-dashboard-header">
                        <h3>🎯 {goal.nome}</h3>
                        <strong>{percentualMeta.toFixed(0)}%</strong>
                    </div>

                    <p>
                        {formatarMoeda(valorAtualMeta)}
                        {" de "}
                        {formatarMoeda(goal.valor_meta)}
                    </p>

                    <div className="goal-bar">
                        <div
                            className="goal-progress"
                            style={{ width: `${percentualMeta}%` }}
                        />
                    </div>
                </div>
            )}

            {modalAberto && (
                <div
                    role="presentation"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setModalAberto(false);
                        }
                    }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1000,
                        background: "rgba(0, 0, 0, 0.75)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <form
                        onSubmit={salvarLimite}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-limite"
                        style={{
                            width: "100%",
                            maxWidth: 400,
                            padding: 24,
                            background: "#18181b",
                            color: "#fff",
                            border: "1px solid #3f3f46",
                            borderRadius: 16,
                            boxSizing: "border-box",
                        }}
                    >
                        <h2 id="titulo-limite">
                            Alterar limite de gastos
                        </h2>

                        <p>
                            Defina quanto você pretende gastar no período
                            considerado pelo dashboard.
                        </p>

                        <label
                            htmlFor="novo-limite"
                            style={{ display: "block", marginBottom: 8 }}
                        >
                            Limite mensal (R$)
                        </label>

                        <input
                            id="novo-limite"
                            type="number"
                            min="0.01"
                            step="0.01"
                            required
                            value={novoLimite}
                            onChange={(event) => setNovoLimite(event.target.value)}
                            style={{
                                width: "100%",
                                padding: 12,
                                background: "#09090b",
                                color: "#fff",
                                border: "1px solid #52525b",
                                borderRadius: 8,
                                boxSizing: "border-box",
                            }}
                        />

                        {erro && (
                            <p role="alert" style={{ color: "#f87171" }}>
                                {erro}
                            </p>
                        )}

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 8,
                                marginTop: 20,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setModalAberto(false)}
                                style={{
                                    padding: "9px 12px",
                                    background: "#27272a",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                style={{
                                    padding: "9px 12px",
                                    background: "#7c3aed",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                }}
                            >
                                Salvar limite
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}

export default Dashboard;
