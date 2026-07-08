export function calculateDashboardMetrics(transactions) {

    const entradas = transactions
        .filter(item => item.tipo === "entrada")
        .reduce((acc, item) => acc + item.valor, 0);

    const saidas = transactions
        .filter(item => item.tipo === "saida")
        .reduce((acc, item) => acc + item.valor, 0);

    const investimentos = transactions
        .filter(item => item.tipo === "investimento")
        .reduce((acc, item) => acc + item.valor, 0);

    const rendaPassiva = transactions
        .filter(item => item.tipo === "renda_passiva")
        .reduce((acc, item) => acc + item.valor, 0);

    const saldo =
        entradas -
        saidas;

    const economia =
        entradas -
        saidas -
        investimentos;

    const tetoGastos = 3000;

    const percentualGasto =
        (saidas / tetoGastos) * 100;

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