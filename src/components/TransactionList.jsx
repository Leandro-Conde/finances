import TransactionItem from "./TransactionItem";


    function TransactionList({
      transactions,
      deleteTransaction,
      editTransaction,
    }) {

  return (
    <section className="transactions">

      <h2>Últimas Transações</h2>

      {transactions.map((transaction) => (

    <TransactionItem

    key={transaction.id}

    transaction={transaction}

    deleteTransaction={deleteTransaction}

    editTransaction={editTransaction}

    />

))}
  
    </section>
  );
}

export default TransactionList;