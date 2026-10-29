
export function processChartData(transactions = [], mode = "diario") {
  const grouped = {};

  transactions.forEach((transaction) => {
    // Evita erros com transações sem data.
    if (!transaction?.data) return;

    const originalDate = String(transaction.data);

    const date =
      mode === "mensal"
        ? originalDate.slice(0, 7)
        : originalDate;

    // ALTERAÇÃO: inicializa todas as séries do gráfico.
    if (!grouped[date]) {
      grouped[date] = {
        data: date,
        entrada: 0,
        saida: 0,
        investimento: 0,
        valorGuardadoUtilizado: 0,
      };
    }

    const valor = Number(transaction.valor) || 0;

    // ALTERAÇÃO: separa as retiradas da reserva das despesas comuns.
    if (
      transaction.tipo === "saida" &&
      transaction.descricao === "Valor guardado usado"
    ) {
      grouped[date].valorGuardadoUtilizado += valor;
      return;
    }

    switch (transaction.tipo) {
      case "entrada":
        grouped[date].entrada += valor;
        break;

      case "saida":
        grouped[date].saida += valor;
        break;

      case "investimento":
        grouped[date].investimento += valor;
        break;

      default:
        break;
    }
  });

  // Mantém os dados organizados cronologicamente.
  return Object.values(grouped).sort((a, b) =>
    a.data.localeCompare(b.data)
  );
}
