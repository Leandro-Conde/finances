import "../styles/transactionItem.css";

function TransactionItem({
    transaction,
    deleteTransaction,
    editTransaction,
}) {

    const cores = {

        entrada:"#22c55e",

        saida:"#ef4444",

        investimento:"#facc15",

        renda_passiva:"#3b82f6",

    };

    return (

        <div className="transaction-item">

            <div className="transaction-left">

                <span
                    className="transaction-dot"
                    style={{
                        background:
                        cores[transaction.tipo]
                    }}
                />

                <div>

                    <h3>
                        {transaction.descricao}
                    </h3>

                    <small>

                        {transaction.categoria}

                    </small>

                </div>

            </div>

            <div className="transaction-right">

                <h3>

                    {transaction.valor.toLocaleString(
                        "pt-BR",
                        {
                            style:"currency",
                            currency:"BRL",
                        }
                    )}

                </h3>

                <div>

                    <button
                        onClick={()=>
                            editTransaction(transaction)
                        }
                    >
                        ✏️
                    </button>

                    <button
                        onClick={()=>
                            deleteTransaction(transaction.id)
                        }
                    >
                        🗑️
                    </button>

                </div>

            </div>

        </div>

    );

}

export default TransactionItem;