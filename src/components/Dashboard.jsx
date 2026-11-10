import { useEffect, useState } from "react";
import { calculateDashboardMetrics } from "../utils/dashboardMetrics";
import MetricCard from "./cards/metricCard";
import { getDashboardInsights } from "../utils/dashboardInsights";

function Dashboard({
    transactions = [],
    allTransactions = [],
    goal,
    limiteGastos = 3000,
    onSalvarLimiteGastos,
    onUsarValorGuardado,
    onEditarMeta,
    saldoBase = 0,
    investimentosBase = 0,
    valorGuardadoUtilizadoBase = 0,
    financialDataLoaded = false,

}) {
    const [modalAberto, setModalAberto] = useState(false);
    const [novoLimite, setNovoLimite] = useState(String(limiteGastos));
    const [erro, setErro] = useState("");

    const [modalValorGuardado, setModalValorGuardado] = useState(false);
    const [valorParaUsar, setValorParaUsar] = useState("");
    const [erroValorGuardado, setErroValorGuardado] = useState("");
    const [salvandoValorGuardado, setSalvandoValorGuardado] = useState(false);

    useEffect(() => {
        setNovoLimite(String(limiteGastos));
    }, [limiteGastos]);

    const {
        saldo,
        entradas,
        saidas,
        investimentos,
        economia,
        tetoGastos,
        percentualGasto,
    } = calculateDashboardMetrics(
        transactions,
        limiteGastos,
        saldoBase,
        investimentosBase
    );

    const insights = getDashboardInsights(transactions);

    
    // Total utilizado do dinheiro guardado
const totalJaUtilizado =
Number(valorGuardadoUtilizadoBase || 0) +
allTransactions
    .filter(
        (item) =>
            item.tipo === "saida" &&
            item.descricao === "Valor guardado usado"
    )
    .reduce(
        (total, item) => total + Number(item.valor || 0),
        0
    );

// Total de investimentos registrados
const totalInvestimentosGuardados =
Number(investimentosBase || 0) +
allTransactions
    .filter((item) => item.tipo === "investimento")
    .reduce(
        (total, item) => total + Number(item.valor || 0),
        0
    );

// CARD INDEPENDENTE:
// Não utiliza valor_inicial nem qualquer informação da meta.
const valorGuardado = Math.max(
0,
totalInvestimentosGuardados - totalJaUtilizado
);

// META INDEPENDENTE:
// Considera o valor inicial e os snapshots registrados na criação.
const valorAtualMeta = goal
? Math.max(
    0,
    Number(goal.valor_inicial || 0) +
        (
            totalInvestimentosGuardados -
            Number(goal.investimentos_snapshot || 0)
        ) -
        (
            totalJaUtilizado -
            Number(goal.utilizado_snapshot || 0)
        )
)
: 0;

const percentualMeta =
goal && Number(goal.valor_meta) > 0
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

    async function usarValorGuardado(event) {
        event.preventDefault();

        const valor = Number(valorParaUsar.replace(",", "."));

        if (!Number.isFinite(valor) || valor <= 0) {
            setErroValorGuardado("Informe um valor válido maior que zero.");
            return;
        }

        if (valor > valorGuardado + 0.001) {
            setErroValorGuardado(
                "O valor informado ultrapassa o dinheiro guardado disponível."
            );
            return;
        }

        if (typeof onUsarValorGuardado !== "function") {
            setErroValorGuardado(
                "A função de utilização ainda não foi conectada."
            );
            return;
        }

        try {
            setErroValorGuardado("");
            setSalvandoValorGuardado(true);

            await onUsarValorGuardado(valor);

            setValorParaUsar("");
            setModalValorGuardado(false);
        } catch (error) {
            console.error("Erro ao usar valor guardado:", error);
            setErroValorGuardado(
                error.message || "Não foi possível registrar a utilização."
            );
        } finally {
            setSalvandoValorGuardado(false);
        }
    }

    if (!financialDataLoaded) {
        return (
            <section className="dashboard">
                <div className="saldo-card">
                    <h2>Saldo Atual</h2>
                    <p>Carregando dados financeiros...</p>
                </div>
            </section>
        );
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
                    titulo="Economia"
                    valor={economia}
                    delay={600}
                />

                <MetricCard
                    titulo="Valor guardado"
                    valor={valorGuardado}
                    delay={660}
                >
                    <button
                        type="button"
                        onClick={() => {
                            setValorParaUsar("");
                            setErroValorGuardado("");
                            setModalValorGuardado(true);
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
                        Usar valor guardado
                    </button>
                </MetricCard>

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

            {modalValorGuardado && (
                <div
                    role="presentation"
                    onClick={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !salvandoValorGuardado
                        ) {
                            setModalValorGuardado(false);
                        }
                    }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1001,
                        background: "rgba(0, 0, 0, 0.75)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <form
                        onSubmit={usarValorGuardado}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-valor-guardado"
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
                        <h2 id="titulo-valor-guardado">
                            Usar valor guardado
                        </h2>

                        <p>
                            Disponível:{" "}
                            <strong>{formatarMoeda(valorGuardado)}</strong>
                        </p>

                        {valorGuardado <= 0 && (
                            <p role="status">
                                Não há dinheiro guardado disponível para utilizar.
                            </p>
                        )}

                        <label
                            htmlFor="valor-para-usar"
                            style={{ display: "block", marginBottom: 8 }}
                        >
                            Quanto deseja utilizar? (R$)
                        </label>

                        <input
                            id="valor-para-usar"
                            type="number"
                            min="0.01"
                            max={valorGuardado}
                            step="0.01"
                            required
                            value={valorParaUsar}
                            
                            /* ALTERAÇÃO: atualiza o valor e limpa o erro antigo ao digitar */
                            onChange={(event) => {
                                setValorParaUsar(event.target.value);
                                setErroValorGuardado("");
                            }}

                            disabled={
                                salvandoValorGuardado || valorGuardado <= 0
                            }
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

                        {erroValorGuardado && (
                            <p role="alert" style={{ color: "#f87171" }}>
                                {erroValorGuardado}
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
                                disabled={salvandoValorGuardado}
                                onClick={() => setModalValorGuardado(false)}
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
                                disabled={
                                    salvandoValorGuardado || valorGuardado <= 0
                                }
                                style={{
                                    padding: "9px 12px",
                                    background: "#7c3aed",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor:
                                        salvandoValorGuardado ||
                                        valorGuardado <= 0
                                            ? "not-allowed"
                                            : "pointer",
                                    opacity:
                                        salvandoValorGuardado ||
                                        valorGuardado <= 0
                                            ? 0.6
                                            : 1,
                                }}
                            >
                                {salvandoValorGuardado
                                    ? "Registrando..."
                                    : "Confirmar utilização"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
                            onChange={(event) =>
                                setNovoLimite(event.target.value)
                            }
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