import { useState } from "react";
import { v4 as uuidv4 } from "uuid";


function TransactionForm({
  transactions,
  setTransactions,
  onSave,
}) {

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("entrada");
  const [data, setData] = useState("");
  const [observacao, setObservacao] = useState("");

    function salvarTransacao() {

      if (!descricao || !valor || !categoria || !data) {
        alert("Preencha todos os campos.");
        return;
      }

      const novaTransacao = {
        id: uuidv4(),
        descricao,
        valor: Number(valor),
        categoria,
        tipo,
        data,
        observacao,
        
      };
    
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        novaTransacao,
      ]);
    
      // Limpa o formulário
      setDescricao("");
      setValor("");
      setCategoria("");
      setTipo("entrada");
      setData("");
      setObservacao("");
      onSave();
    }

  return (
    <div className="transaction-form">

      <h2>Nova Transação</h2>

      <input
        type="text"
        placeholder="Descrição"
        value={descricao}
        onChange={(e) =>
          setDescricao(e.target.value)
        }
      />

      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Valor"
        value={valor}
        onChange={(e) =>
          setValor(e.target.value)
        }
      />

      <input
        type="text"
        placeholder="Categoria"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      />

      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <textarea
        placeholder="Observação"
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
      ></textarea>

<select
   value={tipo}
   onChange={(e) => setTipo(e.target.value)}
  
>

  <option value="entrada">
    Entrada
  </option>

  <option value="saida">
    Saída
  </option>

  <option value="investimento">
    Investimento
  </option>

  <option value="renda_passiva">
    Renda Passiva
  </option>

</select>

      <button
        onClick={salvarTransacao}
      >
        Salvar
      </button>

    </div>

    
  );

  
}



export default TransactionForm;