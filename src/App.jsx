import { useEffect, useState } from "react";
import {

  getLoans,
  createLoan,
  deleteLoan,
  markLoanAsPaid,
  updateLoan,

} from "./services/loanService";
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
  const [monthlyGoal] = useState(3000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filtro, setFiltro] = useState("Todos");
  const [user,setUser]=useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loans, setLoans] = useState([]);
  const [loanModalOpen,setLoanModalOpen]=useState(false);
  const [editingLoan, setEditingLoan] = useState(null);


async function removeLoan(id){

  if(!confirm("Excluir empréstimo?")) return;

  await deleteLoan(id);

  await loadLoans();

}

async function payLoan(id){

  await markLoanAsPaid(id);

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
  
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: false });
  
    if (error) {
      console.error(error);
      return;
    }
  
    setTransactions(data);
  
  }

  async function loadLoans() {

    if (!user) return;

    const data = await getLoans(user.id);

    setLoans(data);

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
  
  }

    
  
  }, [user]);

  async function deleteTransaction(id) {

    await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    loadTransactions();

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
          deleteTransaction={deleteTransaction}
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

            <h3>🎯 Meta Mensal</h3>

            <p>

              Meta

              <strong>

                {" "}
                {monthlyGoal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}

              </strong>

            </p>

            <div className="goal-bar">

              <div
                className="goal-progress"
                style={{
                  width: "0%",
                }}
              />

            </div>

            <small>

              Ainda não implementado

            </small>

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