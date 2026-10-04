export function processChartData(transactions, mode = "diario") {
  const grouped = {};

  transactions.forEach((transaction) => {
    const originalDate = transaction.data;

    let date;

    if (mode === "mensal") {
      // Exemplo: 2026-09-15 → 2026-09
      date = originalDate.slice(0, 7);
    } else {
      // Diário
      date = originalDate;
    }

    if (!grouped[date]) {
      grouped[date] = {
        data: date,
        entrada: 0,
        saida: 0,
        investimento: 0,
      };
    }

    switch (transaction.tipo) {
      case "entrada":
        grouped[date].entrada += transaction.valor;
        break;

      case "saida":
        grouped[date].saida += transaction.valor;
        break;

      case "investimento":
      case "renda_passiva":
        grouped[date].investimento += transaction.valor;
        break;

      default:
        break;
    }
  });

  return Object.values(grouped).sort((a, b) =>
    a.data.localeCompare(b.data)
  );
}