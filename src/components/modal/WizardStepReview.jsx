function WizardStepReview({
  formData,
  pendingTransactions,
  adicionarMovimentacao,
  confirmarTudo,
}) {

  const total =
    pendingTransactions.reduce(
      (acc, item) => acc + item.valor,
      0
    ) + Number(formData.valor || 0);

  return (
    <div>

      <h2>Resumo</h2>

      <h4>Movimentação Atual</h4>

      <p><strong>Tipo:</strong> {formData.tipo}</p>

      <p><strong>Categoria:</strong> {formData.categoria}</p>

      <p><strong>Descrição:</strong> {formData.descricao}</p>

      <p><strong>Valor:</strong> R$ {Number(formData.valor).toFixed(2)}</p>

      <hr />

      <h4>Movimentações adicionadas</h4>

      {pendingTransactions.length === 0 ? (

        <p>Nenhuma movimentação adicionada.</p>

      ) : (

        pendingTransactions.map((item) => (

          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div>

              <strong>{item.descricao}</strong>

              <br />

              <small>{item.categoria}</small>

            </div>

            <strong>
              {item.valor.toLocaleString(
                "pt-BR",
                {
                  style: "currency",
                  currency: "BRL",
                }
              )}
            </strong>

          </div>

        ))

      )}

      <hr />

      <h3>
        Total: {total.toLocaleString(
          "pt-BR",
          {
            style: "currency",
            currency: "BRL",
          }
        )}
      </h3>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 20,
        }}
      >

        <button
          onClick={adicionarMovimentacao}
        >
          ➕ Adicionar outra
        </button>

        <button
          onClick={confirmarTudo}
        >
          ✅ Confirmar Tudo
        </button>

      </div>

    </div>
  );
}

export default WizardStepReview;