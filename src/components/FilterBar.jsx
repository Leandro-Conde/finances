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
    <div className="filter-bar" role="group" aria-label="Filtrar transações">
      {filtros.map((item) => (
        <button
          key={item}
          type="button"
          className={filtro === item ? "active" : ""}
          aria-pressed={filtro === item}
          onClick={() => setFiltro(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
