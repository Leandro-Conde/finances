import "../../styles/cards.css";

function MetricCard({

    titulo,
    valor,
    children,
    delay = 0,

}) {

    function getClass(){

        switch(titulo){

            case "Saldo Atual":
                return "saldo";

            case "Entradas":
                return "entrada";

            case "Saídas":
                return "saida";

            case "Investimentos":
                return "investimento";

            case "Renda Passiva":
                return "passiva";

            case "Economia":
                return "economia";

            case "Teto de Gastos":
                return "gastos";

            default:
                return "";

        }

    }

    return(

        <div

            className={`metric-card ${getClass()}`}

            style={{

                animationDelay:`${delay}ms`

            }}

        >

            <h4>{titulo}</h4>

            <h2>

                {valor.toLocaleString(

                    "pt-BR",

                    {

                        style:"currency",

                        currency:"BRL"

                    }

                )}

            </h2>

            {children}

        </div>

    );

}

export default MetricCard;