
import { useEffect, useRef, useState } from "react";

import GoalModal from "./components/GoalModal";
import Profile from "./pages/Profile";

import {
  getScheduledBills,
  createScheduledBill,
  updateScheduledBill,
  deleteScheduledBill,
} from "./services/scheduledBillService";

import {
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
} from "./services/goalService";

import {
  getLoans,
  getLoanById,
  createLoan,
  deleteLoan,
  markLoanAsPaid,
  updateLoan,
} from "./services/loanService";

import {
  getTransactions,
  deleteTransaction,
  getPreservedFinancialBalances,
  getPreservedChartHistory,
  cleanTransactionHistory,
  countTransactionsToClean,
} from "./services/transactionService";

import {
  getUserSettings,
  saveSpendingLimit,
} from "./services/userSettingsService";

import LoanList from "./components/LoanList";
import LoanModal from "./components/LoanModal";
import Header from "./components/Header";
import TransactionList from "./components/TransactionList";
import Modal from "./components/Modal";
import ModalWizard from "./components/modal/ModalWizard";
import Home from "./components/Home";
import FilterBar from "./components/FilterBar";
import Login from "./components/auth/Login";
import ScheduledBillModal from "./components/ScheduledBillModal";

import "./styles/dashboard.css";

import { supabase } from "./services/supabase";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [saldoBase, setSaldoBase] = useState(0);
  const [investimentosBase, setInvestimentosBase] = useState(0);
  const [financialDataLoaded, setFinancialDataLoaded] = useState(false);
  const [cleaningHistory, setCleaningHistory] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [cleanupPeriod, setCleanupPeriod] = useState("3");
  const [cleanupCount, setCleanupCount] = useState(null);
  const [countingCleanup, setCountingCleanup] = useState(false);
  const [cleanupCountError, setCleanupCountError] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [filtro, setFiltro] = useState("Todos");

  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [loans, setLoans] = useState([]);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);

  const [goal, setGoal] = useState(null);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [scheduledBills, setScheduledBills] = useState([]);
  const [scheduledBillModalOpen, setScheduledBillModalOpen] = useState(false);
  const [editingScheduledBill, setEditingScheduledBill] = useState(null);

  const [showLoans, setShowLoans] = useState(true);
  const [showScheduledBills, setShowScheduledBills] = useState(true);
  const [showTransactions, setShowTransactions] = useState(true);

  const [limiteGastos, setLimiteGastos] = useState(3000);
  const [valorGuardadoUtilizadoBase, setValorGuardadoUtilizadoBase] = useState(0);

  const [preservedChartHistory, setPreservedChartHistory] = useState([]);



  async function loadTransactions(userId = user?.id) {
    if (!userId || currentUserIdRef.current !== userId) {
        return false;
    }

    setFinancialDataLoaded(false);

    try {
        const [
            transactionsData,
            balances,
            chartHistoryData,
        ] = await Promise.all([
            getTransactions(userId),
            getPreservedFinancialBalances(userId),
            getPreservedChartHistory(userId),
        ]);

        // Impede que uma resposta antiga sobrescreva a sessão atual.
        if (currentUserIdRef.current !== userId) {
            return false;
        }

        setTransactions(transactionsData);
        setSaldoBase(balances.saldoBase);
        setInvestimentosBase(balances.investimentosBase);

        setValorGuardadoUtilizadoBase(
            Number(balances?.valorGuardadoUtilizadoBase ?? 0)
        );

        setPreservedChartHistory(chartHistoryData);
        setFinancialDataLoaded(true);

        return true;
    } catch (error) {
        if (currentUserIdRef.current === userId) {
            console.error("Erro ao carregar dados financeiros:", error);

            window.alert(
                "Não foi possível carregar seus dados financeiros. Verifique sua conexão e tente novamente."
            );
        }

        return false;
    }
}

async function loadLoans(userId = user?.id) {
    if (!userId || currentUserIdRef.current !== userId) return;

    const data = await getLoans(userId);

    if (currentUserIdRef.current !== userId) return;

    setLoans(data);
}

async function loadGoal(userId = user?.id) {
    if (!userId || currentUserIdRef.current !== userId) return;

    const data = await getGoal(userId);

    if (currentUserIdRef.current !== userId) return;

    setGoal(data);
}

async function loadUserSettings(userId = user?.id) {
    if (!userId || currentUserIdRef.current !== userId) return;

    try {
        const limite = await getUserSettings(userId);

        if (currentUserIdRef.current !== userId) return;

        setLimiteGastos(limite);
    } catch (error) {
        if (currentUserIdRef.current === userId) {
            console.error("Erro ao carregar configurações:", error);
        }
    }
}

async function loadScheduledBills(userId = user?.id) {
    if (!userId || currentUserIdRef.current !== userId) return;

    try {
        const data = await getScheduledBills(userId);

        if (currentUserIdRef.current !== userId) return;

        setScheduledBills(data);
    } catch (error) {
        if (currentUserIdRef.current === userId) {
            console.error("Erro ao carregar contas agendadas:", error);
        }
    }
}


  // Controla a navegação entre o dashboard e o perfil.
  const [currentPage, setCurrentPage] = useState("home");

  async function removeLoan(id) {
    if (!confirm("Excluir empréstimo?")) return;

    await deleteLoan(id);
    await loadLoans();
  }

  async function payLoan(id) {
    const loan = await getLoanById(id);

    await supabase.from("transactions").insert({
      user_id: user.id,
      tipo: loan.tipo === "receber" ? "entrada" : "saida",
      categoria: "Empréstimos",
      descricao:
        loan.tipo === "receber"
          ? `Recebido de ${loan.pessoa}`
          : `Pagamento para ${loan.pessoa}`,
      valor: Number(loan.valor),
      data: new Date().toISOString().slice(0, 10),
      observacao: loan.descricao,
    });

    await markLoanAsPaid(id);

    await loadTransactions();
    await loadLoans();
  }

  async function saveLoan(loan) {
    if (loan.id) {
      await updateLoan(loan.id, loan);
    } else {
      await createLoan({
        ...loan,
        valor: Number(loan.valor),
        status: loan.status,
        user_id: user.id,
      });
    }

    await loadLoans();

    setEditingLoan(null);
    setLoanModalOpen(false);
  }





  async function handleUseSavedMoney(valor) {
    if (!user) {
      throw new Error("Você precisa estar autenticado.");
    }

    if (!goal) {
      throw new Error("Cadastre uma meta antes de usar o valor guardado.");
    }

    const valorUtilizado = Number(valor);

    if (!Number.isFinite(valorUtilizado) || valorUtilizado <= 0) {
      throw new Error("Informe um valor válido.");
    }

    // Calcula o total de investimentos, incluindo o saldo preservado.
    const totalInvestimentos =
      Number(investimentosBase || 0) +
      transactions
        .filter((item) => item.tipo === "investimento")
        .reduce(
          (total, item) => total + Number(item.valor || 0),
          0
        );

    // Calcula o total já utilizado, incluindo o saldo preservado.
    const totalValorGuardadoUtilizado =
      Number(valorGuardadoUtilizadoBase || 0) +
      transactions
        .filter(
          (item) =>
            item.tipo === "saida" &&
            item.descricao === "Valor guardado usado"
        )
        .reduce(
          (total, item) => total + Number(item.valor || 0),
          0
        );

    // Considera o saldo inicial e as movimentações posteriores aos snapshots.
    const valorDisponivel = Math.max(
      0,
      Number(goal.valor_inicial || 0) +
        (
          totalInvestimentos -
          Number(goal.investimentos_snapshot || 0)
        ) -
        (
          totalValorGuardadoUtilizado -
          Number(goal.utilizado_snapshot || 0)
        )
    );

    // Impede utilizar mais dinheiro do que está disponível.
    if (valorUtilizado > valorDisponivel + 0.001) {
      throw new Error(
        "O valor informado ultrapassa o dinheiro guardado disponível."
      );
    }

    // Utiliza a data local para evitar problemas de fuso horário.
    const hoje = new Date();

    const dataLocal = [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, "0"),
      String(hoje.getDate()).padStart(2, "0"),
    ].join("-");

    // Registra a utilização no Supabase.
    const { error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        tipo: "saida",
        categoria: "Valor guardado",
        descricao: "Valor guardado usado",
        valor: valorUtilizado,
        data: dataLocal,
        observacao: "Utilização de dinheiro guardado.",
      });

    if (error) {
      console.error("Erro ao utilizar valor guardado:", error);
      throw new Error(
        "Não foi possível registrar a utilização no Supabase."
      );
    }

    // Atualiza os dados financeiros após a operação.
    await loadTransactions();
  }



const currentUserIdRef = useRef(null);
currentUserIdRef.current = user?.id ?? null;


  useEffect(() => {
    if (!user || !financialDataLoaded || cleaningHistory) {
      setCleanupCount(null);
      return;
    }

    let cancelled = false;

    async function updateCleanupCount() {
      setCountingCleanup(true);
      setCleanupCount(null);
      setCleanupCountError("");

      try {
        const count = await countTransactionsToClean(
          user.id,
          cleanupPeriod === "todos"
            ? "todos"
            : Number(cleanupPeriod)
        );

        if (!cancelled) {
          setCleanupCount(count);
        }
      } catch (error) {
        console.error("Erro ao contar transações:", error);

        if (!cancelled) {
          setCleanupCountError(
            "Não foi possível calcular a quantidade. Tente novamente."
          );
        }
      } finally {
        if (!cancelled) {
          setCountingCleanup(false);
        }
      }
    }

    updateCleanupCount();

    return () => {
      cancelled = true;
    };
  }, [
    user?.id,
    financialDataLoaded,
    cleanupPeriod,
    cleaningHistory,
  ]);

  async function handleSaveSpendingLimit(novoLimite) {
    if (!user) {
      throw new Error("Usuário não autenticado.");
    }

    const limiteSalvo = await saveSpendingLimit(
      user.id,
      novoLimite
    );

    setLimiteGastos(limiteSalvo);
  }

  async function saveScheduledBill(bill) {
    if (bill.id) {
      await updateScheduledBill(bill.id, {
        nome: bill.nome,
        categoria: bill.categoria,
        valor: Number(bill.valor),
        tipo: bill.tipo,
        vencimento: bill.vencimento,
        recorrencia: bill.recorrencia,
        dias_lembrete: Number(bill.dias_lembrete),
        ativo: bill.ativo,
      });
    } else {
      await createScheduledBill({
        nome: bill.nome,
        categoria: bill.categoria,
        valor: Number(bill.valor),
        tipo: bill.tipo,
        vencimento: bill.vencimento,
        recorrencia: bill.recorrencia,
        dias_lembrete: Number(bill.dias_lembrete),
        ativo: bill.ativo,
        user_id: user.id,
      });
    }

    await loadScheduledBills();

    setScheduledBillModalOpen(false);
    setEditingScheduledBill(null);
  }

  async function removeScheduledBill(id) {
    if (!confirm("Excluir esta conta agendada?")) return;

    try {
      await deleteScheduledBill(id);
      await loadScheduledBills();
    } catch (error) {
      console.error("ERRO AO EXCLUIR CONTA:", error);
    }
  }



  async function saveGoal(goalData) {
    if (!user) {
      throw new Error("Usuário não autenticado.");
    }

    const dadosMeta = {
      nome: String(goalData.nome || "").trim(),
      valor_meta: Number(goalData.valor_meta),
      valor_inicial: Number(goalData.valor_inicial || 0),
      prazo_meses: Number(goalData.prazo_meses),
    };

    if (!dadosMeta.nome) {
      throw new Error("Informe um nome para a meta.");
    }

    if (
      !Number.isFinite(dadosMeta.valor_meta) ||
      dadosMeta.valor_meta <= 0
    ) {
      throw new Error("O valor-alvo precisa ser maior que zero.");
    }

    if (
      !Number.isFinite(dadosMeta.valor_inicial) ||
      dadosMeta.valor_inicial < 0
    ) {
      throw new Error("O valor inicial não pode ser negativo.");
    }

    if (
      !Number.isInteger(dadosMeta.prazo_meses) ||
      dadosMeta.prazo_meses <= 0
    ) {
      throw new Error("O prazo precisa ser um número inteiro de meses.");
    }

    if (goalData.id) {
      // Edição: preserva os snapshots originais.
      await updateGoal(goalData.id, dadosMeta);
    } else {
      // Criação: registra o saldo existente como ponto de partida.
      await createGoal({
        ...dadosMeta,
        user_id: user.id,
        investimentos_snapshot: totalInvestimentos,
        utilizado_snapshot: totalValorGuardadoUtilizado,
      });
    }

    await loadGoal();

    setGoalModalOpen(false);
    setEditingGoal(null);
  }


async function removeGoal() {
  if (!user || !goal?.id) {
    window.alert("Nenhuma meta encontrada para excluir.");
    return;
  }

  const confirmar = window.confirm(
    "Deseja realmente excluir a meta de Investimentos/Guardados? Os investimentos e as transações financeiras serão preservados."
  );

  if (!confirmar) return;

  try {
    await deleteGoal(goal.id);
    await loadGoal();

    setEditingGoal(null);
    setGoalModalOpen(false);

    window.alert("Meta excluída com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir meta:", error);
    window.alert("Não foi possível excluir a meta. Tente novamente.");
  }
}


  function handleEditGoalFromDashboard() {
    setEditingGoal(goal);
    setGoalModalOpen(true);
  }

 // 1. Controla a autenticação e acompanha mudanças de sessão.
useEffect(() => {
  let mounted = true;
  let authEventReceived = false;

  const {
      data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
      authEventReceived = true;

      if (!mounted) return;

      setUser(session?.user ?? null);
      setLoadingAuth(false);
  });

  supabase.auth.getSession()
      .then(({ data, error }) => {
          if (!mounted || authEventReceived) return;

          if (error) {
              console.error("Erro ao recuperar sessão:", error);
          }

          setUser(data.session?.user ?? null);
          setLoadingAuth(false);
      })
      .catch((error) => {
          if (!mounted || authEventReceived) return;

          console.error("Erro ao verificar autenticação:", error);
          setUser(null);
          setLoadingAuth(false);
      });

  return () => {
      mounted = false;
      subscription.unsubscribe();
  };
}, []);


// 2. Sincroniza o nome do usuário real com a tabela profiles.
useEffect(() => {
  if (!user || user.is_anonymous === true) return;

  let cancelled = false;

  async function ensureProfile() {
      const metadata = user.user_metadata || {};

      const nome =
          metadata.full_name ||
          metadata.nome ||
          metadata.name ||
          "";

      if (!nome.trim()) return;

      try {
          const { error } = await supabase
              .from("profiles")
              .upsert(
                  {
                      id: user.id,
                      nome: nome.trim(),
                  },
                  {
                      onConflict: "id",
                      ignoreDuplicates: true,
                  }
              );

          if (cancelled) return;

          if (error) {
              console.error(
                  "Não foi possível sincronizar o perfil:",
                  error
              );
          }
      } catch (error) {
          if (!cancelled) {
              console.error(
                  "Erro ao sincronizar perfil:",
                  error
              );
          }
      }
  }

  ensureProfile();

  return () => {
      cancelled = true;
  };
}, [user?.id]);


// 3. Limpa os estados anteriores e carrega os dados da identidade atual.
useEffect(() => {
  const userId = user?.id;

  // Limpa dados financeiros e estados da sessão anterior.
  setTransactions([]);
  setSaldoBase(0);
  setInvestimentosBase(0);
  setValorGuardadoUtilizadoBase(0);
  setPreservedChartHistory([]);

  setLoans([]);
  setGoal(null);
  setScheduledBills([]);

  setLimiteGastos(3000);
  setFinancialDataLoaded(false);

  setCleanupCount(null);
  setCleanupCountError("");
  setCountingCleanup(false);

  // Fecha modais e reseta estados de edição.
  setIsModalOpen(false);
  setEditingTransaction(null);

  setLoanModalOpen(false);
  setEditingLoan(null);

  setGoalModalOpen(false);
  setEditingGoal(null);

  setScheduledBillModalOpen(false);
  setEditingScheduledBill(null);

  setCurrentPage("home");

  if (!userId) return;

  async function loadUserData() {
      await Promise.all([
          loadTransactions(userId),
          loadLoans(userId),
          loadGoal(userId),
          loadScheduledBills(userId),
          loadUserSettings(userId),
      ]);
  }

  loadUserData();
}, [user?.id]);

  async function removeTransaction(id) {
    try {
      await deleteTransaction(id);
      await loadTransactions();
    } catch (err) {
      console.error(err);
    }
  }



  async function handleCleanTransactionHistory(months = null) {
    if (!user) {
      window.alert("Você precisa estar autenticado.");
      return;
    }

    if (cleaningHistory || !financialDataLoaded) {
      window.alert("Aguarde o carregamento dos dados financeiros.");
      return;
    }

    if (
      months !== null &&
      (!Number.isInteger(months) || months < 1)
    ) {
      window.alert("Selecione um período válido.");
      return;
    }

    const confirmation =
      months === null
        ? "Todo o histórico será apagado. O saldo e os investimentos acumulados serão preservados. Deseja continuar?"
        : `Serão apagadas as transações anteriores ao limite de ${months} mês(es). O saldo e os investimentos acumulados serão preservados. Deseja continuar?`;

    if (!window.confirm(confirmation)) return;

    setCleaningHistory(true);

    try {
      const result = await cleanTransactionHistory(months);

      console.log("Resultado da limpeza:", result);

      // A exclusão já ocorreu no banco. Agora atualizamos a tela.
      const transactionsReloaded = await loadTransactions();

      await loadGoal();

      if (!transactionsReloaded) {
        window.alert(
          `A limpeza foi executada: ${result?.deleted_count ?? 0} transação(ões) removida(s). Porém, não foi possível atualizar os dados na tela. Recarregue o aplicativo.`
        );
        return result;
      }

      window.alert(
        `Limpeza concluída! ${result?.deleted_count ?? 0} transação(ões) removida(s).`
      );

      return result;
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);

      window.alert(
        "Não foi possível confirmar a limpeza. Confira os dados no Supabase antes de tentar novamente."
      );

      return null;
    } finally {
      setCleaningHistory(false);
    }
  }



  function editTransaction(transaction) {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }

  const filteredTransactions =
    filtro === "Todos"
      ? transactions
      : transactions.filter((item) => {
          if (filtro === "Entradas") {
            return item.tipo === "entrada";
          }

          if (filtro === "Saídas") {
            return item.tipo === "saida";
          }

          if (filtro === "Investimentos") {
            return item.tipo === "investimento";
          }

          if (filtro === "Renda Passiva") {
            return item.tipo === "renda_passiva";
          }

          return true;
        });

  if (loadingAuth) {
    return <h2>Carregando...</h2>;
  }

  if (!user) {
    return <Login />;
  }

  const totalInvestimentos =
  Number(investimentosBase || 0) +
  transactions
    .filter((item) => item.tipo === "investimento")
    .reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );



    const totalValorGuardadoUtilizado =
    Number(valorGuardadoUtilizadoBase || 0) +
    transactions
      .filter(
        (item) =>
          item.tipo === "saida" &&
          item.descricao === "Valor guardado usado"
      )
      .reduce(
        (total, item) => total + Number(item.valor || 0),
        0
      );



const valorAtualMeta = goal
? Math.max(
    0,
    Number(goal.valor_inicial || 0) +
      (
        totalInvestimentos -
        Number(goal.investimentos_snapshot || 0)
      ) -
      (
        totalValorGuardadoUtilizado -
        Number(goal.utilizado_snapshot || 0)
      )
  )
: 0;


  const percentualMeta =
    goal && Number(goal.valor_meta) > 0
      ? Math.min(
          (valorAtualMeta / Number(goal.valor_meta)) * 100,
          100
        )
      : 0;

  /* ALTERAÇÃO: removida a segunda declaração duplicada de percentualMeta */

  return (
    <>
      {/* CABEÇALHO: permanece visível nas duas telas */}
      <Header
        currentPage={currentPage}
        onOpenProfile={() => setCurrentPage("profile")}
        onGoHome={() => setCurrentPage("home")}
      />

      <a className="skip-to-content" href="#main-content">Pular para o conteúdo</a>

      <main id="main-content" className="app-main" tabIndex="-1">
      {/* NAVEGAÇÃO: mostra o perfil ou o dashboard */}
      {currentPage === "profile" ? (
        <Profile />
      ) : (
        <>
          {/* Modal Nova Transação / Edição */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTransaction(null);
            }}
          >
            <ModalWizard
              user={user}
              transactions={transactions}
              setTransactions={setTransactions}
              onClose={() => {
                setIsModalOpen(false);
                setEditingTransaction(null);
                loadTransactions();
              }}
            />
          </Modal>

          {/* Modal Empréstimo */}
          <Modal
            isOpen={loanModalOpen}
            onClose={() => {
              setLoanModalOpen(false);
              setEditingLoan(null);
            }}
          >
            <LoanModal
              loan={editingLoan}
              onClose={() => {
                setLoanModalOpen(false);
                setEditingLoan(null);
              }}
              onSave={saveLoan}
            />
          </Modal>

          {/* Modal Meta */}
          <Modal
            isOpen={goalModalOpen}
            onClose={() => {
              setGoalModalOpen(false);
              setEditingGoal(null);
            }}
          >
            <GoalModal
              key={`${goalModalOpen ? "open" : "closed"}-${editingGoal?.id || "new"}`}
              goal={editingGoal}
              initialSavedAmount={Math.max(
                0,
                totalInvestimentos - totalValorGuardadoUtilizado
              )}
              onClose={() => {
                setGoalModalOpen(false);
                setEditingGoal(null);
              }}
              onSave={saveGoal}
            />
          </Modal>

          {/* Modal Contas Agendadas */}
          <Modal
            isOpen={scheduledBillModalOpen}
            onClose={() => {
              setScheduledBillModalOpen(false);
              setEditingScheduledBill(null);
            }}
          >
            <ScheduledBillModal
              bill={editingScheduledBill}
              onClose={() => {
                setScheduledBillModalOpen(false);
                setEditingScheduledBill(null);
              }}
              onSave={saveScheduledBill}
            />
          </Modal>

          {/* Ações */}
          <div className="actions">
            <button
              className="new-transaction-btn"
              onClick={() => {
                setEditingTransaction(null);
                setIsModalOpen(true);
              }}
            >
              ➕ Nova Transação
            </button>

            <details className="history-cleanup panel-card">
  <summary className="history-cleanup-summary">
    <span>🗂️ Gerenciar histórico</span>
    <span className="history-cleanup-arrow">⌄</span>
  </summary>

  <div className="history-cleanup-content">
    <p>
      Remova transações antigas sem perder o saldo e os investimentos
      acumulados.
    </p>

    <label htmlFor="cleanup-period">
      Período do histórico
    </label>

    <select
      id="cleanup-period"
      value={cleanupPeriod}
      onChange={(event) => setCleanupPeriod(event.target.value)}
      disabled={cleaningHistory || countingCleanup}
    >
      <option value="1">Mais de 1 mês</option>
      <option value="3">Mais de 3 meses</option>
      <option value="6">Mais de 6 meses</option>
      <option value="12">Mais de 12 meses</option>
      <option value="todos">Todo o histórico</option>
    </select>

    <p aria-live="polite">
      {countingCleanup
        ? "Calculando transações..."
        : cleanupCountError
          ? cleanupCountError
          : cleanupCount === null
            ? "Aguardando dados financeiros..."
            : `${cleanupCount} transação(ões) serão removidas.`}
    </p>

    <button
      type="button"
      className="history-cleanup-btn"
      disabled={
        cleaningHistory ||
        countingCleanup ||
        !financialDataLoaded ||
        cleanupCount === null ||
        cleanupCountError !== "" ||
        cleanupCount === 0
      }
      onClick={() =>
        handleCleanTransactionHistory(
          cleanupPeriod === "todos"
            ? null
            : Number(cleanupPeriod)
        )
      }
    >
      {cleaningHistory ? "Limpando..." : "Limpar histórico"}
    </button>

    <small>
      A operação não pode ser desfeita pela interface. Confira a
      seleção antes de confirmar.
    </small>
  </div>
</details>
          </div>

          {/* Dashboard */}
          <Home
      transactions={filteredTransactions}
      allTransactions={transactions}
      loans={loans}
      scheduledBills={scheduledBills}
      goal={goal}
      limiteGastos={limiteGastos}
      onSalvarLimiteGastos={handleSaveSpendingLimit}
      onUsarValorGuardado={handleUseSavedMoney}
      onEditarMeta={handleEditGoalFromDashboard}
      saldoBase={saldoBase}
      investimentosBase={investimentosBase}
      financialDataLoaded={financialDataLoaded}
      valorGuardadoUtilizadoBase={valorGuardadoUtilizadoBase}
      preservedChartHistory={preservedChartHistory}
    />
          {/* Filtros */}
          <div className="filter-toggle">
            <button
              type="button"
              aria-expanded={showFilters}
              aria-controls="transaction-filters"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters
                ? "🔽 Esconder Filtros"
                : "▶ Mostrar Filtros"}
            </button>
          </div>

          {showFilters && (
            <div id="transaction-filters">
            <FilterBar
              filtro={filtro}
              setFiltro={setFiltro}
            />
            </div>
          )}

          {/* Transações + Painel lateral */}
          <div className="transactions-container">
            {/* Últimas Transações */}
            <div className="panel-card">
              <div className="panel-header">
                <h3>Últimas Transações</h3>

                {filteredTransactions.length >= 2 && (
                  <button
                    className="loan-toggle"
                    onClick={() =>
                      setShowTransactions(!showTransactions)
                    }
                    title={
                      showTransactions
                        ? "Recolher lista"
                        : "Expandir lista"
                    }
                  >
                    {showTransactions ? "Fechar" : "Abrir"}
                  </button>
                )}
              </div>

              {(showTransactions ||
                filteredTransactions.length < 2) && (
                <TransactionList
                  transactions={filteredTransactions}
                  deleteTransaction={removeTransaction}
                  editTransaction={editTransaction}
                />
              )}
            </div>

            <div className="side-panel">
              {/* Empréstimos */}
              <div className="panel-card">
                <div className="panel-header">
                  <h3>Empréstimos</h3>

                  <div className="loan-actions">
                    <button
                      type="button"
                      className="loan-add"
                      aria-label="Adicionar empréstimo"
                      onClick={() => {
                        setEditingLoan(null);
                        setLoanModalOpen(true);
                      }}
                      title="Adicionar empréstimo"
                    >
                      +
                    </button>

                    {loans.length >= 2 && (
                      <button
                        className="loan-toggle"
                        onClick={() => setShowLoans(!showLoans)}
                        title={
                          showLoans
                            ? "Recolher lista"
                            : "Expandir lista"
                        }
                      >
                        {showLoans ? "Fechar" : "Abrir"}
                      </button>
                    )}
                  </div>
                </div>

                {showLoans &&
                  (loans.length === 0 ? (
                    <p>Nenhum empréstimo cadastrado.</p>
                  ) : (
                    <LoanList
                      loans={loans}
                      onDelete={removeLoan}
                      onPay={payLoan}
                      onEdit={(loan) => {
                        setEditingLoan(loan);
                        setLoanModalOpen(true);
                      }}
                    />
                  ))}
              </div>

              {/* Meta Mensal */}
              <div className="panel-card">
              <div
                className="goal-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <h3>Investimentos/Guardados</h3>

                <div style={{ display: "flex", gap: 8 }}>
                  {!goal && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGoal(null);
                        setGoalModalOpen(true);
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: "#7c3aed",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      + Criar
                    </button>
                  )}

                  {goal && (
                    <button
                      type="button"
                      onClick={removeGoal}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "1px solid #ef4444",
                        background: "transparent",
                        color: "#ef4444",
                        cursor: "pointer",
                      }}
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>

                {goal ? (
                  <>
                    <p className="goal-name">
                      <strong>{goal.nome}</strong>
                    </p>

                    <div className="goal-values">
                      <strong className="goal-current">
                        {valorAtualMeta.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </strong>

                      <span>
                        {" / "}
                        {Number(goal.valor_meta).toLocaleString(
                          "pt-BR",
                          {
                            style: "currency",
                            currency: "BRL",
                          }
                        )}
                      </span>
                    </div>

                    <div className="goal-percentage">
                      {percentualMeta.toFixed(0)}%
                    </div>

                    <div className="goal-bar">
                      <div
                        className="goal-progress"
                        style={{
                          width: `${percentualMeta}%`,
                        }}
                      />
                    </div>

                    <p className="goal-status">
                      {valorAtualMeta >= Number(goal.valor_meta)
                        ? "🎉 Meta atingida!"
                        : `Faltam ${(
                            Number(goal.valor_meta) -
                            valorAtualMeta
                          ).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}`}
                    </p>
                  </>
                ) : (
                  <small>Nenhuma meta cadastrada.</small>
                )}
              </div>

              {/* Próximos Eventos */}
              <div className="panel-card">
                <div className="panel-header">
                  <h3>📅 Próximos Eventos</h3>

                  <div className="loan-actions">
                    <button
                      type="button"
                      className="loan-add"
                      aria-label="Adicionar empréstimo"
                      onClick={() => {
                        setEditingScheduledBill(null);
                        setScheduledBillModalOpen(true);
                      }}
                    >
                      +
                    </button>

                    {scheduledBills.length >= 2 && (
                      <button
                        className="loan-toggle"
                        onClick={() =>
                          setShowScheduledBills(
                            !showScheduledBills
                          )
                        }
                        title={
                          showScheduledBills
                            ? "Recolher lista"
                            : "Expandir lista"
                        }
                      >
                        {showScheduledBills ? "Fechar" : "Abrir"}
                      </button>
                    )}
                  </div>
                </div>

                {scheduledBills.length === 0 ? (
                  <p>Nenhuma conta agendada.</p>
                ) : (
                  (showScheduledBills ||
                    scheduledBills.length < 2) && (
                    <div className="scheduled-bills-list">
                      {scheduledBills.map((bill) => {
                        const hoje = new Date();

                        const vencimento = new Date(
                          `${bill.vencimento}T00:00:00`
                        );

                        const diferenca = Math.ceil(
                          (vencimento - hoje) /
                            (1000 * 60 * 60 * 24)
                        );

                        return (
                          <div
                            className="scheduled-bill-item"
                            key={bill.id}
                          >
                            <div className="scheduled-bill-info">
                              <strong>{bill.nome}</strong>
                              <span>{bill.categoria}</span>

                              <small>
                                Vence em{" "}
                                {diferenca <= 0
                                  ? "hoje"
                                  : `${diferenca} dia${
                                      diferenca > 1 ? "s" : ""
                                    }`}
                              </small>
                            </div>

                            <div className="scheduled-bill-right">
                              <strong className="scheduled-bill-value">
                                {Number(bill.valor).toLocaleString(
                                  "pt-BR",
                                  {
                                    style: "currency",
                                    currency: "BRL",
                                  }
                                )}
                              </strong>

                              <div className="scheduled-bill-actions">
                                <button
                                  className="scheduled-bill-edit"
                                  onClick={() => {
                                    setEditingScheduledBill(bill);
                                    setScheduledBillModalOpen(true);
                                  }}
                                  title="Editar conta"
                                >
                                  ✏️
                                </button>

                                <button
                                  className="scheduled-bill-delete"
                                  onClick={() =>
                                    removeScheduledBill(bill.id)
                                  }
                                  title="Excluir conta"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}
      </main>
    </>
  );
}

export default App;

