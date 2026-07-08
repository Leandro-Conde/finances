export function parseCurrency(valor) {
    return Number(
      valor
        .replace(/\./g, "") // remove separador de milhar
        .replace(",", ".")  // troca vírgula decimal por ponto
    );
  }