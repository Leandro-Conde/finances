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

    const data = processChartData(transactions);
    
    return (
      <div
        style={{
          width: "100%",
          height: 420,
          marginTop: 10,
          padding: "10px 0",

          background:"#18181b",
          borderRadius:20,
          padding:20,
        }}
      >

      <h2>Evolução Financeira</h2>

        <ResponsiveContainer>
  
        <AreaChart
          data={data}
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
          tickFormatter={(value) => formatCurrency(value)}
      />
            <Tooltip
              contentStyle={{
                  background: "#18181B",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  color: "#fff",
              }}
              formatter={(value) => formatCurrency(value)}
              labelStyle={{
                  color: "#fff",
              }}
          />
  
              <Legend
            iconType="circle"
            />
  
            <Area
              type="monotone"
              dataKey="entrada"
              stroke="#22c55e"
              fill="#22c55e33"
              strokeWidth={3}
              animationDuration={900}
          />

          <Area
              type="monotone"
              dataKey="saida"
              stroke="#ef4444"
              fill="#ef444433"
              strokeWidth={3}
              animationDuration={900}
          />

          <Area
              type="monotone"
              dataKey="investimento"
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