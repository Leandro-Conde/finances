import { useState } from "react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { formatCurrency } from "../../utils/formatCurrency";
import { processChartData } from "../../utils/processChartData";

function FinanceChart({ transactions }) {
  const [mode, setMode] = useState("diario");

  // Define se o gráfico começa da esquerda ou da direita
  const [direction, setDirection] = useState("esquerda");

  // Define se o gráfico será normal ou invertido
  const [inverted, setInverted] = useState(false);

  // Controla se a lista de opções está aberta
  const [showOptions, setShowOptions] = useState(false);

  const data = processChartData(transactions, mode);

  // Inverte a ordem dos dados
  const orderedData =
    direction === "esquerda"
      ? data
      : [...data].reverse();

  // Inverte saídas e investimentos apenas visualmente
  const chartData = orderedData.map((item) => ({
    ...item,

    saida: inverted
      ? -item.saida
      : item.saida,

    investimento: inverted
      ? -item.investimento
      : item.investimento,
  }));

  return (
    <div
      style={{
        width: "100%",
        height: 420,
        marginTop: 10,
        background: "#18181b",
        borderRadius: 20,
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      {/* CABEÇALHO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: showOptions ? 15 : 5,
          gap: 10,
        }}
      >
        <h2 style={{ margin: 0 }}>
          Evolução Financeira
        </h2>

        {/* BOTÃO PARA ABRIR/FECHAR OPÇÕES */}
        <button
          onClick={() =>
            setShowOptions(!showOptions)
          }
          style={{
            background: "#111113",
            color: "#fff",
            border: "1px solid #2d2d2d",
            borderRadius: 9,
            padding: "7px 12px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "0.2s ease",
          }}
        >
          {showOptions
            ? "▲ Ocultar"
            : "⚙ Opções"}
        </button>
      </div>

      {/* OPÇÕES RETRÁTEIS */}
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
          }}
        >
          {/* DIÁRIO */}
          <button
            onClick={() =>
              setMode("diario")
            }
            style={{
              background:
                mode === "diario"
                  ? "#7c3aed"
                  : "transparent",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              padding: "7px 12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Diário
          </button>

          {/* MENSAL */}
          <button
            onClick={() =>
              setMode("mensal")
            }
            style={{
              background:
                mode === "mensal"
                  ? "#7c3aed"
                  : "transparent",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              padding: "7px 12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Mensal
          </button>

          {/* DIREÇÃO */}
          <button
            onClick={() =>
              setDirection(
                direction === "esquerda"
                  ? "direita"
                  : "esquerda"
              )
            }
            style={{
              background:
                direction === "direita"
                  ? "#7c3aed"
                  : "transparent",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              padding: "7px 12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {direction === "esquerda"
              ? "← Esquerda"
              : "Direita →"}
          </button>

          {/* NORMAL / INVERTIDO */}
          <button
            onClick={() =>
              setInverted(!inverted)
            }
            style={{
              background: inverted
                ? "#7c3aed"
                : "transparent",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              padding: "7px 12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {inverted
              ? "Invertido"
              : "Normal"}
          </button>
        </div>
      )}

      {/* GRÁFICO */}
      <ResponsiveContainer
        width="100%"
        height={showOptions ? "78%" : "88%"}
      >
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: -15,
            bottom: 0,
          }}
        >
          <CartesianGrid
            stroke="#2d2d2d"
            vertical={false}
          />

          <XAxis
            dataKey="data"
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              formatCurrency(Math.abs(value))
            }
          />

          <Tooltip
            contentStyle={{
              background: "#18181B",
              border: "1px solid #333",
              borderRadius: "12px",
              color: "#fff",
            }}
            formatter={(value) =>
              formatCurrency(Math.abs(value))
            }
            labelStyle={{
              color: "#fff",
            }}
          />

          <Legend iconType="circle" />

          {/* ENTRADAS */}
          <Area
            type="monotone"
            dataKey="entrada"
            name="Entradas"
            stroke="#22c55e"
            fill="#22c55e33"
            strokeWidth={3}
            animationDuration={900}
          />

          {/* SAÍDAS */}
          <Area
            type="monotone"
            dataKey="saida"
            name="Saídas"
            stroke="#ef4444"
            fill="#ef444433"
            strokeWidth={3}
            animationDuration={900}
          />

          {/* INVESTIMENTOS */}
          <Area
            type="monotone"
            dataKey="investimento"
            name="Investimentos"
            stroke="#facc15"
            fill="#facc1533"
            strokeWidth={3}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FinanceChart;