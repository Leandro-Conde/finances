import { useEffect, useState } from "react";
import GoalModal from "./components/GoalModal";

import {

    getGoal,
    createGoal,
    updateGoal,

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
} from "./services/transactionService";
import LoanList from "./components/LoanList";
import LoanModal from "./components/LoanModal";

import Header from "./components/Header";
import TransactionList from "./components/TransactionList";
import Modal from "./components/Modal";
import ModalWizard from "./components/modal/ModalWizard";
import Home from "./components/Home";
import FilterBar from "./components/FilterBar";
import Login from "./components/auth/Login";


import "./styles/dashboard.css";

import { supabase } from "./services/supabase";


function App() {

  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filtro, setFiltro] = useState("Todos");
  const [user,setUser]=useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loans, setLoans] = useState([]);
  const [loanModalOpen,setLoanModalOpen]=useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [goal, setGoal] = useState(null);
const [goalModalOpen, setGoalModalOpen] = useState(false);
const [editingGoal, setEditingGoal] = useState(null);


async function removeLoan(id){

  if(!confirm("Excluir empréstimo?")) return;

  await deleteLoan(id);

  await loadLoans();

}

async function payLoan(id){

  const loan = await getLoanById(id);

  await supabase
      .from("transactions")
      .insert({

          user_id: user.id,

          tipo: loan.tipo === "receber"
              ? "entrada"
              : "saida",

          categoria: "Empréstimos",

          descricao:
              loan.tipo === "receber"
                  ? `Recebido de ${loan.pessoa}`
                  : `Pagamento para ${loan.pessoa}`,

          valor: Number(loan.valor),

          data: new Date().toISOString().slice(0,10),

          observacao: loan.descricao,

      });

  await markLoanAsPaid(id);

  await loadTransactions();

  await loadLoans();

}


    async function saveLoan(loan){

      if(loan.id){

          await updateLoan(

              loan.id,

              loan

          );

      }

      else{

          await createLoan({

              ...loan,

              valor:Number(loan.valor),

              status:loan.status,

              user_id:user.id,

          });

      }

      await loadLoans();

      setEditingLoan(null);

      setLoanModalOpen(false);

    }

    async function loadTransactions() {

      if (!user) return;
  
      try {
  
          const data = await getTransactions(user.id);
  
          setTransactions(data);
  
      } catch (err) {
  
          console.error(err);
  
      }
  
  }

  async function loadLoans() {

    if (!user) return;

    const data = await getLoans(user.id);

    setLoans(data);

}

async function loadGoal() {

  if (!user) return;

  const data = await getGoal(user.id);

  setGoal(data);

}

async function saveGoal(goalData) {

  if (goalData.id) {

      await updateGoal(

          goalData.id,

          {

              nome: goalData.nome,
              valor_meta: Number(goalData.valor_meta),
              valor_inicial: Number(goalData.valor_inicial),
              prazo_meses: Number(goalData.prazo_meses),

          }

      );

  } else {

      await createGoal({

          nome: goalData.nome,
          valor_meta: Number(goalData.valor_meta),
          valor_inicial: Number(goalData.valor_inicial),
          prazo_meses: Number(goalData.prazo_meses),
          user_id: user.id,

      });

  }

  await loadGoal();

  setGoalModalOpen(false);

  setEditingGoal(null);

}



  useEffect(() => {

    supabase.auth.getSession().then(({ data }) => {

        setUser(data.session?.user ?? null);
        setLoadingAuth(false);

    });

    const {

        data: listener,

    } = supabase.auth.onAuthStateChange((event, session) => {

        setUser(session?.user ?? null);

    });

    return () => listener.subscription.unsubscribe();

}, []);

  useEffect(() => {

    if (user) {

      loadTransactions();
  
      loadLoans();

      loadGoal();
  
  }

    
  
  }, [user]);

  async function removeTransaction(id) {

    try {

        await deleteTransaction(id);

        await loadTransactions();

    } catch (err) {

        console.error(err);

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

          if (filtro === "Entradas")
            return item.tipo === "entrada";

          if (filtro === "Saídas")
            return item.tipo === "saida";

          if (filtro === "Investimentos")
            return item.tipo === "investimento";

          if (filtro === "Renda Passiva")
            return item.tipo === "renda_passiva";

          return true;

        });

        if (loadingAuth) {

          return <h2>Carregando...</h2>;

        }

        if (!user) {

          return <Login />;
        
        }

        

  return (
    <>
      <Header />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >

        <ModalWizard
          user={user}
          transactions={transactions}
          setTransactions={setTransactions}
          onClose={() => {
            setIsModalOpen(false);
            loadTransactions();
          }}
        />

      </Modal>

      <Modal

    isOpen={loanModalOpen}

    onClose={()=>setLoanModalOpen(false)}

>

      <LoanModal

      loan={editingLoan}

      onClose={() => {

          setLoanModalOpen(false);

          setEditingLoan(null);

      }}

      onSave={saveLoan}

      />

<Modal
    isOpen={loanModalOpen}
    onClose={() => setLoanModalOpen(false)}
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

<Modal
    isOpen={goalModalOpen}
    onClose={() => setGoalModalOpen(false)}
>

    <GoalModal
        goal={editingGoal}
        onClose={() => {
            setGoalModalOpen(false);
            setEditingGoal(null);
        }}
        onSave={saveGoal}
    />

</Modal>

    </Modal>

      <div className="actions">

        <button
          className="new-transaction-btn"
          onClick={() => setIsModalOpen(true)}
        >
          ➕ Nova Transação
        </button>

      </div>

      <Home
        transactions={filteredTransactions}
      />

      <div className="filter-toggle">

        <button
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters
            ? "🔽 Esconder Filtros"
            : "▶ Mostrar Filtros"}
        </button>

      </div>

      {showFilters && (

        <FilterBar
          filtro={filtro}
          setFiltro={setFiltro}
        />

      )}

      <div className="transactions-container">

      <TransactionList
    transactions={filteredTransactions}
    deleteTransaction={removeTransaction}
    editTransaction={editTransaction}
/>

        <div className="side-panel">

        <div className="panel-card">

        <div className="panel-header">

            <h3>Empréstimos</h3>

            <button

                className="loan-add"

                onClick={()=>setLoanModalOpen(true)}

            >

                +

            </button>

        </div>

        {

            loans.length===0 ?

            (

                <p>

                    Nenhum empréstimo cadastrado.

                </p>

            )

            :

            (

              <LoanList

              loans={loans}
          
              onDelete={removeLoan}
          
              onPay={payLoan}
          
              onEdit={(loan)=>{

                setEditingLoan(loan);
            
                setLoanModalOpen(true);
            
            }}
          
          />

            )

        }

        </div>

        <div className="panel-card">

<div className="panel-header">

    <h3>🎯 Meta Mensal</h3>

    <button
        className="loan-add"
        onClick={() => {
            setEditingGoal(goal);
            setGoalModalOpen(true);
        }}
    >
        +
    </button>

</div>

{goal ? (
    <>

        <p>

            <strong>{goal.nome}</strong>

        </p>

        <p>

            Objetivo:{" "}

            {Number(goal.valor_meta).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
            })}

        </p>

        <p>

            Guardado:{" "}

            {Number(goal.valor_inicial).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
            })}

        </p>

        <div className="goal-bar">

            <div
                className="goal-progress"
                style={{
                    width: `${Math.min(
                        (goal.valor_inicial / goal.valor_meta) * 100,
                        100
                    )}%`,
                }}
            />

        </div>

    </>
) : (

    <small>Nenhuma meta cadastrada.</small>

)}

</div>

          <div className="panel-card">

            <h3>📅 Próximos Eventos</h3>

            <p>Nenhum evento.</p>

          </div>

        </div>

      </div>

    </>
  );

}

export default App;