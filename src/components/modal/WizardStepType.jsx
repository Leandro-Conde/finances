function WizardStepType({
  formData,
  setFormData,
  setStep,
}) {
  const tipos = [
    {
      id: "entrada",
      titulo: "🟢 Entrada",
      descricao: "Recebimentos de qualquer origem.",
    },
    {
      id: "saida",
      titulo: "🔴 Saída",
      descricao: "Despesas e pagamentos.",
    },
    {
      id: "investimento",
      titulo: "🟡 Investimento",
      descricao: "Aplicações financeiras.",
    },
    {
      id: "renda_passiva",
      titulo: "🔵 Renda Passiva",
      descricao: "Ganhos automáticos.",
    },
  ];

  function selecionarTipo(tipo) {
    setFormData({
      ...formData,
      tipo,
    });

    setStep(2);
  }

  return (
    <div>

      <h2>Escolha o tipo da movimentação</h2>

      <div className="wizard-type-grid">

        {tipos.map((tipo) => (

          <button
            key={tipo.id}
            className="wizard-type-card"
            onClick={() => selecionarTipo(tipo.id)}
          >

            <h3>{tipo.titulo}</h3>

            <p>{tipo.descricao}</p>

          </button>

        ))}

      </div>

    </div>
  );
}

export default WizardStepType;