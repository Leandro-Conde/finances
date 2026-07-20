import LoanCard from "./LoanCard";

function LoanList({

    loans,

    onDelete,

    onPay,

    onEdit,

}){

    return(

        <>

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

        </>

    );

}

export default LoanList;