
export function processChartData(
  transactions = [],
  mode = "diario",
  preservedHistory = []
) {
  const grouped = {};

  function getDateKey(value) {
    if (!value) return null;

    const originalDate = String(value).slice(0, 10);

    return mode === "mensal"
      ? originalDate.slice(0, 7)
      : originalDate;
  }

  function ensureDate(date) {
    if (!date) return null;

    if (!grouped[date]) {
      grouped[date] = {
        data: date,
        entrada: 0,
        saida: 0,
        investimento: 0,
        valorGuardadoUtilizado: 0,
      };
    }

    return grouped[date];
  }

  // 1. Adiciona os dados já preservados no Supabase.
  preservedHistory.forEach((item) => {
    const date = getDateKey(item.data);
    const point = ensureDate(date);

    if (!point) return;

    point.entrada += Number(item.entrada) || 0;
    point.saida += Number(item.saida) || 0;
    point.investimento += Number(item.investimento) || 0;
    point.valorGuardadoUtilizado +=
      Number(item.valor_guardado_utilizado) || 0;
  });

  // 2. Adiciona as transações que ainda existem.
  transactions.forEach((transaction) => {
    if (!transaction?.data) return;

    const date = getDateKey(transaction.data);
    const point = ensureDate(date);

    if (!point) return;

    const valor = Number(transaction.valor) || 0;

    if (
      transaction.tipo === "saida" &&
      transaction.descricao === "Valor guardado usado"
    ) {
      point.valorGuardadoUtilizado += valor;
      return;
    }

    switch (transaction.tipo) {
      case "entrada":
        point.entrada += valor;
        break;

      case "saida":
        point.saida += valor;
        break;

      case "investimento":
        point.investimento += valor;
        break;

      default:
        break;
    }
  });

  // 3. Retorna os pontos em ordem cronológica.
  return Object.values(grouped).sort((a, b) =>
    a.data.localeCompare(b.data)
  );
}
