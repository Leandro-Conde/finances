import LoanCard from "./LoanCard";

function LoanList({ loans }) {

    return (

        <>

            {loans.map((loan)=>(

                <LoanCard

                    key={loan.id}

                    loan={loan}

                />

            ))}

        </>

    );

}

export default LoanList;