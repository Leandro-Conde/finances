import "../styles/loan.css";

function LoanCard({

    loan,

    onDelete,

    onPay,

    onEdit,

}){

    return (

        <div className={`loan-card ${loan.tipo}`}>

            <div>

                <strong>

                    {loan.pessoa}

                </strong>

            </div>

            <small>

                {loan.descricao}

            </small>

            <p>

                📅 {loan.vencimento}

            </p>

            <p>

                Prioridade:

                <strong>

                    {" "}

                    {loan.prioridade}

                </strong>

            </p>

            <h3>

                {Number(loan.valor).toLocaleString(

                    "pt-BR",

                    {

                        style: "currency",

                        currency: "BRL",

                    }

                )}

            </h3>

            <div className="loan-footer">

                <span>

                    {

                        loan.tipo === "receber"

                            ? "💰 Receber"

                            : "💸 Pagar"

                    }

                </span>

                <span
                    className={`loan-status ${loan.status}`}
                >

                    {

                        loan.status === "pendente"

                            ? "🟡 Pendente"

                            : "🟢 Quitado"

                    }

                </span>

            </div>

            <div className="loan-actions">

            <button

            onClick={()=>onEdit(loan)}

            >

            ✏ Editar

            </button>

            <button

            disabled={loan.status==="pago"}

            onClick={()=>onPay(loan.id)}

            >

            ✔ Quitar

            </button>

            <button

            onClick={()=>onDelete(loan.id)}

            >

            🗑 Excluir

            </button>

            </div>

        </div>

    );

}

export default LoanCard;