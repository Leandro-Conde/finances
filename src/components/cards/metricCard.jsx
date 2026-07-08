import "../../styles/cards.css";


function MetricCard({

  titulo,
  valor,
  children,

}){

  return(

      <div className="metric-card">

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