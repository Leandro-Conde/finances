import "../../styles/cards.css";

function MetricCard({

    titulo,
    valor,
    insight,
    delay,
    children,

}){

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

            {insight !== null && insight !== undefined && (

            <small
                className={
                    insight > 0
                        ? "positive"
                        : insight < 0
                        ? "negative"
                        : "neutral"
                }
            >

                {insight > 0 ? "+" : ""}

                {insight.toFixed(1)}%

            </small>

            )}

            {children}

        </div>

    );

}

export default MetricCard;