
export function processChartData(transactions, mode = "diario") {
  const grouped = {};

  transactions.forEach((transaction) => {
    const originalDate = transaction.data;

    const date =
      mode === "mensal"
        ? originalDate.slice(0, 7)
        : originalDate;

    if (!grouped[date]) {
      grouped[date] = {
        data: date,
        entrada: 0,
        saida: 0,
        investimento: 0,
        valorGuardadoUtilizado: 0, // ALTERAÇÃO: nova série
      };
    }

    const valor = Number(transaction.valor || 0);

    // ALTERAÇÃO: separa o uso da reserva das despesas comuns.
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
      case "renda_passiva":
        grouped[date].investimento += valor;
        break;

      default:
        break;
    }
  });

  return Object.values(grouped).sort((a, b) =>
    a.data.localeCompare(b.data)
  );
}
