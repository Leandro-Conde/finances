import LoanCard from "./LoanCard";

function LoanList({

    loans,

    onDelete,

    onPay,

    onEdit,

}){

    return(

        <div className="loan-list">

            {

                loans.map((loan)=>(

                    <LoanCard

                        key={loan.id}

                        loan={loan}

                        onDelete={onDelete}

                        onPay={onPay}

                        onEdit={onEdit}

                    />

                ))

            }

        </div>

    );

}

export default LoanList;