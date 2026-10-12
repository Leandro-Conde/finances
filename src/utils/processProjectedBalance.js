const HORIZON_MONTHS = 1;

function toLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(value) {
  if (!value || typeof value !== "string") return null;

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function addMonthsClamped(date, months, preferredDay = date.getDate()) {
  const firstOfTargetMonth = new Date(
    date.getFullYear(),
    date.getMonth() + months,
    1
  );

  const lastDay = new Date(
    firstOfTargetMonth.getFullYear(),
    firstOfTargetMonth.getMonth() + 1,
    0
  ).getDate();

  return new Date(
    firstOfTargetMonth.getFullYear(),
    firstOfTargetMonth.getMonth(),
    Math.min(preferredDay, lastDay)
  );
}

function getCurrentBalance(transactions, todayISO) {
  return transactions.reduce((balance, transaction) => {
    const date = transaction.data?.slice(0, 10);

    // O saldo inicial usa apenas transações efetivadas até hoje.
    if (!date || date > todayISO) return balance;

    const value = Number(transaction.valor) || 0;

    switch (transaction.tipo) {
      case "entrada":
      case "renda_passiva":
        return balance + value;

      case "saida":
      case "investimento":
        return balance - value;

      default:
        return balance;
    }
  }, 0);
}

function addObligation(obligations, date, value, details) {
  const key = toLocalISO(date);

  if (!obligations.has(key)) {
    obligations.set(key, []);
  }

  obligations.get(key).push({
    value,
    ...details,
  });
}

function addScheduledBillOccurrences(
  obligations,
  bill,
  today,
  endDate
) {
  if (bill.ativo !== true) return;

  const dueDate = parseLocalDate(bill.vencimento);
  if (!dueDate) return;

  const value = Number(bill.valor);
  if (!Number.isFinite(value) || value <= 0) return;

  const sign = bill.tipo === "entrada" ? 1 : -1;

  if (bill.recorrencia !== "mensal") {
    if (dueDate >= today && dueDate <= endDate) {
      addObligation(obligations, dueDate, sign * value, {
        source: "conta",
        id: bill.id,
        description: bill.nome || "Conta agendada",
        amount: value,
      });
    }

    return;
  }

  // Mantém o dia original do vencimento, ajustando datas como 31/02.
  const preferredDay = dueDate.getDate();
  let occurrence = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    1
  );

  while (occurrence <= endDate) {
    const candidate = addMonthsClamped(
      occurrence,
      0,
      preferredDay
    );

    if (candidate >= today && candidate <= endDate) {
      addObligation(obligations, candidate, sign * value, {
        source: "conta",
        id: bill.id,
        description: bill.nome || "Conta mensal",
        amount: value,
      });
    }

    occurrence = new Date(
      occurrence.getFullYear(),
      occurrence.getMonth() + 1,
      1
    );
  }
}

function addLoanObligations(obligations, loans, today, endDate) {
  loans.forEach((loan) => {
    if (loan.status !== "pendente") return;

    const dueDate = parseLocalDate(loan.vencimento);
    if (!dueDate || dueDate < today || dueDate > endDate) return;

    const value = Number(loan.valor);
    if (!Number.isFinite(value) || value <= 0) return;

    // "pagar" reduz o saldo; "receber" aumenta o saldo.
    const sign = loan.tipo === "receber" ? 1 : -1;

    addObligation(obligations, dueDate, sign * value, {
      source: "emprestimo",
      id: loan.id,
      description: loan.descricao || loan.pessoa || "Empréstimo",
      person: loan.pessoa || "",
      amount: value,
    });
  });
}

function findPossibleDuplicates(obligations) {
  const possibleDuplicates = [];

  obligations.forEach((items, date) => {
    const bills = items.filter((item) => item.source === "conta");
    const loans = items.filter((item) => item.source === "emprestimo");

    bills.forEach((bill) => {
      loans.forEach((loan) => {
        if (Math.abs(bill.amount - loan.amount) < 0.005) {
          possibleDuplicates.push({
            date,
            amount: bill.amount,
            billDescription: bill.description,
            loanDescription: loan.description,
            billId: bill.id,
            loanId: loan.id,
          });
        }
      });
    });
  });

  return possibleDuplicates;
}

export function processProjectedBalance({
  chartData,
  allTransactions = [],
  loans = [],
  scheduledBills = [],
  mode = "diario",
  now = new Date(),
}) {
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const todayISO = toLocalISO(today);
  const endDate = addMonthsClamped(today, HORIZON_MONTHS);

  const currentBalance = getCurrentBalance(allTransactions, todayISO);
  const obligations = new Map();

  scheduledBills.forEach((bill) => {
    addScheduledBillOccurrences(obligations, bill, today, endDate);
  });

  addLoanObligations(obligations, loans, today, endDate);

  const possibleDuplicates = findPossibleDuplicates(obligations);

  // O mapa preserva os dados reais que já eram exibidos pelo gráfico.
  const points = new Map();

  chartData.forEach((item) => {
    points.set(item.data, {
      ...item,
      saldoProjetado: null,
    });
  });

  let runningBalance = currentBalance;

  if (mode === "mensal") {
    const currentMonth = todayISO.slice(0, 7);
    const endMonth = toLocalISO(endDate).slice(0, 7);

    // O ponto do mês atual começa no saldo de hoje.
    const currentPoint = points.get(currentMonth) || {
      data: currentMonth,
      entrada: 0,
      saida: 0,
      investimento: 0,
    };

    points.set(currentMonth, {
      ...currentPoint,
      saldoProjetado: runningBalance,
    });

    let monthCursor = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    while (toLocalISO(monthCursor).slice(0, 7) <= endMonth) {
      const monthKey = toLocalISO(monthCursor).slice(0, 7);

      obligations.forEach((items, dateKey) => {
        if (dateKey.slice(0, 7) === monthKey) {
          items.forEach((item) => {
            runningBalance += item.value;
          });
        }
      });

      const point = points.get(monthKey) || {
        data: monthKey,
        entrada: 0,
        saida: 0,
        investimento: 0,
      };

      points.set(monthKey, {
        ...point,
        saldoProjetado: runningBalance,
      });

      monthCursor = new Date(
        monthCursor.getFullYear(),
        monthCursor.getMonth() + 1,
        1
      );
    }
  } else {
    const endISO = toLocalISO(endDate);

    for (
      let date = new Date(today);
      toLocalISO(date) <= endISO;
      date.setDate(date.getDate() + 1)
    ) {
      const dateKey = toLocalISO(date);

      (obligations.get(dateKey) || []).forEach((item) => {
        runningBalance += item.value;
      });

      const point = points.get(dateKey) || {
        data: dateKey,
        entrada: 0,
        saida: 0,
        investimento: 0,
      };

      points.set(dateKey, {
        ...point,
        saldoProjetado: runningBalance,
      });
    }
  }

  return {
    data: [...points.values()].sort((a, b) =>
      a.data.localeCompare(b.data)
    ),
    currentBalance,
    possibleDuplicates,
  };
}