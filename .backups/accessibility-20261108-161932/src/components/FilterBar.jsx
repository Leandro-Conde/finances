import "../styles/filterbar.css";


function FilterBar({ filtro, setFiltro }) {

    const filtros = [
        "Todos",
        "Entradas",
        "Saídas",
        "Investimentos",
        "Renda Passiva",
    ];

    return (

        <div className="filter-bar">

            {filtros.map((item) => (

                <button

                    key={item}

                    className={
                        filtro === item
                            ? "active"
                            : ""
                    }

                    onClick={() => setFiltro(item)}

                >

                    {item}

                </button>

            ))}

        </div>

    );

}

export default FilterBar;