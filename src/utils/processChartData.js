export function processChartData(transactions) {
    const grouped = {};
  
    transactions.forEach((transaction) => {
      const date = transaction.data;
  
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
  
    return Object.values(grouped);
  }