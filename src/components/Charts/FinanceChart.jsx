
import { useEffect, useState } from "react";

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { formatCurrency } from "../../utils/formatCurrency";
import { processChartData } from "../../utils/processChartData";
import { processProjectedBalance } from "../../utils/processProjectedBalance";

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDiasAteVirarOMes() {
  const hoje = new Date();

  const inicioProximoMes = new Date(
    hoje.getFullYear(),
    hoje.getMonth() + 1,
    1
  );

  const hojeSemHorario = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );

  return Math.round(
    (inicioProximoMes - hojeSemHorario) / (1000 * 60 * 60 * 24)
  );
}

function getDateThreeMonthsAgo() {
  const today = new Date();
  const date = new Date(today);

  date.setDate(1);
  date.setMonth(date.getMonth() - 3);

  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  date.setDate(Math.min(today.getDate(), lastDay));

  return date;
}

function FinanceChart({
  transactions = [],
  allTransactions = [],
  loans = [],
  scheduledBills = [],
  limiteGastos = 3000,
}) {
  const [mode, setMode] = useState("diario");
  const [direction, setDirection] = useState("esquerda");
  const [inverted, setInverted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showProjection, setShowProjection] = useState(true);
  const [alertaTetoAtivo, setAlertaTetoAtivo] = useState(false);

  const diasRestantes = getDiasAteVirarOMes();

  const today = new Date();
  const todayISO = formatLocalDate(today);
  const mesAtual = todayISO.slice(0, 7);
  const tresMesesAtrasISO = formatLocalDate(getDateThreeMonthsAgo());

  const limiteNumerico = Number(limiteGastos) || 0;

  // Soma as despesas reais do mês atual.
  const gastosMesAtual = allTransactions
    .filter((item) => {
      if (item.tipo !== "saida" || !item.data) return false;

      return String(item.data).slice(0, 7) === mesAtual;
    })
    .reduce((total, item) => {
      return total + Number(item.valor || 0);
    }, 0);

  // Ativa o alerta quando os gastos ultrapassam o limite.
  // Desativa quando o limite passa a cobrir os gastos.
  useEffect(() => {
    const chaveAlerta = `atlasFinanceTetoUltrapassado-${mesAtual}`;
    const tetoUltrapassado =
      limiteNumerico > 0 && gastosMesAtual > limiteNumerico;

    try {
      if (tetoUltrapassado) {
        localStorage.setItem(chaveAlerta, "true");
        setAlertaTetoAtivo(true);
      } else {
        localStorage.removeItem(chaveAlerta);
        setAlertaTetoAtivo(false);
      }
    } catch (error) {
      console.error("Não foi possível atualizar o alerta:", error);
      setAlertaTetoAtivo(tetoUltrapassado);
    }
  }, [mesAtual, gastosMesAtual, limiteNumerico]);

  const historicalData = processChartData(transactions, mode);

  const data = showProjection
    ? historicalData
    : historicalData.filter((item) => {
        if (mode === "mensal") {
          const inicioMes = tresMesesAtrasISO.slice(0, 7);

          return item.data >= inicioMes && item.data <= mesAtual;
        }

        return item.data >= tresMesesAtrasISO && item.data <= todayISO;
      });

  const projection = processProjectedBalance({
    chartData: data,
    allTransactions,
    loans,
    scheduledBills,
    mode,
  });

  const orderedData =
    direction === "esquerda"
      ? projection.data
      : [...projection.data].reverse();

  const chartData = orderedData.map((item) => ({
    ...item,
    saida: inverted ? -item.saida : item.saida,
    investimento: inverted ? -item.investimento : item.investimento,
  }));

  return (
    <div
      style={{
        width: "100%",
        height: 500,
        marginTop: 10,
        background: "#18181b",
        borderRadius: 20,
        padding: 20,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <style>
        {`
          @keyframes alertaTetoBrilho {
            0%, 100% {
              filter:
                drop-shadow(0 0 3px #ff0000)
                drop-shadow(0 0 7px #ff0000);
              opacity: 1;
            }

            50% {
              filter:
                drop-shadow(0 0 7px #ff0000)
                drop-shadow(0 0 16px #ff2222);
              opacity: 0.75;
            }
          }

          @keyframes alertaTetoPulso {
            0%, 100% {
              box-shadow: 0 0 8px #ef444455;
            }

            50% {
              box-shadow: 0 0 22px #ef4444aa;
            }
          }
        `}
      </style>

      {/* Cabeçalho e controles principais */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: showOptions ? 15 : 5,
          gap: 10,
          flexWrap: "wrap",
          flexShrink: 0,
        }}
      >
        <h2 style={{ margin: 0 }}>Evolução Financeira</h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowProjection((current) => !current)}
            title="Ativar ou desativar a previsão de saldo"
            aria-pressed={showProjection}
            style={{
              background: showProjection ? "#27272a" : "#111113",
              color: showProjection ? "#ffffff" : "#a1a1aa",
              border: `1px solid ${
                showProjection ? "#ffffff" : "#3f3f46"
              }`,
              borderRadius: 9,
              padding: "7px 12px",
              cursor: "pointer",
              fontWeight: 600,
              whiteSpace: "nowrap",
              transition: "0.2s ease",
            }}
          >
            {showProjection
              ? "● Previsão ligada"
              : "○ Previsão desligada"}
          </button>

          <button
            onClick={() => setShowOptions((current) => !current)}
            style={{
              background: "#111113",
              color: "#ffffff",
              border: "1px solid #2d2d2d",
              borderRadius: 9,
              padding: "7px 12px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "0.2s ease",
            }}
          >
            {showOptions ? "▲ Opções" : "⚙ Opções"}
          </button>
        </div>
      </div>

      {/* Aviso de possíveis duplicatas */}
      {showProjection && projection.possibleDuplicates.length > 0 && (
        <div
          role="status"
          style={{
            background: "#332713",
            border: "1px solid #8a6427",
            color: "#fde68a",
            borderRadius: 8,
            padding: "8px 10px",
            margin: "10px 0",
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          ⚠️ Há {projection.possibleDuplicates.length} possível(is)
          duplicata(s) entre empréstimos e contas agendadas com o mesmo
          vencimento e valor. Confira os cadastros: nenhum item foi removido
          automaticamente.
        </div>
      )}

      {/* Opções do gráfico */}
      {showOptions && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 6,
            marginBottom: 15,
            background: "#111113",
            padding: 5,
            borderRadius: 10,
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setMode("diario")}
            style={{
              background: mode === "diario" ? "#7c3aed" : "transparent",
              color: "#ffffff",
              border: "none",
              borderRadius: 7,
              padding: "7px 12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Diário
          </button>

          <button
            onClick={() => setMode("mensal")}
            style={{
              background: mode === "mensal" ? "#7c3aed" : "transparent",
              color: "#ffffff",
              border: "none",
              borderRadius: 7,
              padding: "7px 12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Mensal
          </button>

          <button
            onClick={() =>
              setDirection((current) =>
                current === "esquerda" ? "direita" : "esquerda"
              )
            }
            style={{
              background: direction === "direita" ? "#7c3aed" : "transparent",
              color: "#ffffff",
              border: "none",
              borderRadius: 7,
              padding: "7px 12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {direction === "esquerda" ? "← Esquerda" : "Direita →"}
          </button>

          <button
            onClick={() => setInverted((current) => !current)}
            style={{
              background: inverted ? "#7c3aed" : "transparent",
              color: "#ffffff",
              border: "none",
              borderRadius: 7,
              padding: "7px 12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {inverted ? "Invertido" : "Normal"}
          </button>
        </div>
      )}

      {/* Área do gráfico */}
      <div
        style={{
          flex: "1 1 0",
          minHeight: 0,
          width: "100%",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -5, bottom: 0 }}
          >
            <CartesianGrid stroke="#2d2d2d" vertical={false} />

            <XAxis
              dataKey="data"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(Math.abs(value))}
            />

            <YAxis
              yAxisId="saldo"
              hide
              domain={["auto", "auto"]}
            />

            <Tooltip
              contentStyle={{
                background: "#18181B",
                border: "1px solid #333",
                borderRadius: 12,
                color: "#ffffff",
              }}
              formatter={(value, name) => [
                formatCurrency(
                  name === "Saldo projetado" ? value : Math.abs(value)
                ),
                name,
              ]}
              labelStyle={{ color: "#ffffff" }}
            />

            <Legend iconType="circle" />

            <Area
              type="monotone"
              dataKey="entrada"
              name="Entradas"
              stroke="#22c55e"
              fill="#22c55e33"
              strokeWidth={3}
              animationDuration={900}
            />

            <Area
              type="monotone"
              dataKey="saida"
              name="Saídas"
              stroke={alertaTetoAtivo ? "#ff0000" : "#ef4444"}
              fill={alertaTetoAtivo ? "#ff000033" : "#ef444433"}
              strokeWidth={alertaTetoAtivo ? 5 : 3}
              style={
                alertaTetoAtivo
                  ? { animation: "alertaTetoBrilho 1.2s ease-in-out infinite" }
                  : undefined
              }
              animationDuration={900}
            />

            <Area
              type="monotone"
              dataKey="investimento"
              name="Investimentos"
              stroke="#facc15"
              fill="#facc1533"
              strokeWidth={3}
              animationDuration={900}
            />

            {showProjection && (
              <Line
                yAxisId="saldo"
                type="monotone"
                dataKey="saldoProjetado"
                name="Saldo projetado"
                stroke="#ffffff"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#ffffff",
                  stroke: "#18181b",
                }}
                connectNulls={false}
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alerta de teto abaixo do gráfico */}
      {alertaTetoAtivo && (
        <div
          role="alert"
          style={{
            background: "#450a0a",
            border: "1px solid #ef4444",
            color: "#fecaca",
            borderRadius: 10,
            padding: "10px 14px",
            marginTop: 12,
            fontSize: 13,
            fontWeight: 700,
            animation: "alertaTetoPulso 1.5s ease-in-out infinite",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 15, marginBottom: 5 }}>
            🚨 TETO DE GASTOS ULTRAPASSADO!
          </div>

          <div>
            Gastos do mês: {formatCurrency(gastosMesAtual)}
            {" · "}
            Limite: {formatCurrency(limiteNumerico)}
          </div>

          <div style={{ marginTop: 5, fontWeight: 500 }}>
            {diasRestantes === 0
              ? "O mês termina hoje. O alerta será atualizado na virada do mês."
              : `Faltam ${diasRestantes} ${
                  diasRestantes === 1 ? "dia" : "dias"
                } para virar o mês.`}{" "}
            O alerta será encerrado automaticamente na virada do mês,
            ou antes, se você aumentar o limite para cobrir seus gastos.
          </div>
        </div>
      )}
    </div>
  );
}

export default FinanceChart;
