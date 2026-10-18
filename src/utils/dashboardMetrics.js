
export function calculateDashboardMetrics(
    transactions,
    limiteGastos = 3000,
    saldoBase = 0,
    investimentosBase = 0
) {
    const entradas = transactions
        .filter(item => item.tipo === "entrada")
        .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    const saidas = transactions
        .filter(item => item.tipo === "saida")
        .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    const investimentosRecentes = transactions
        .filter(item => item.tipo === "investimento")
        .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    const investimentos =
        Number(investimentosBase || 0) + investimentosRecentes;

    const rendaPassiva = transactions
        .filter(item => item.tipo === "renda_passiva")
        .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    // O saldo-base representa somente o impacto das transações
    // que já foram excluídas do histórico.
    const saldo = Number(saldoBase || 0) + entradas - saidas;

    const economia = saldo - investimentos;

    const tetoGastos = Number(limiteGastos) || 0;

    const percentualGasto = tetoGastos > 0
        ? (saidas / tetoGastos) * 100
        : 0;

    return {
        saldo,
        entradas,
        saidas,
        investimentos,
        rendaPassiva,
        economia,
        tetoGastos,
        percentualGasto,
    };
}
