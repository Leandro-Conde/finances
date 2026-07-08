import { useState } from "react";

import WizardStepType from "./WizardStepType";
import WizardStepInfo from "./WizardStepInfo";
import WizardStepReview from "./WizardStepReview";

import { supabase } from "../../services/supabase";
import { parseCurrency } from "../../utils/parseCurrency";

function ModalWizard({
  user,
  transactions,
  setTransactions,
  onClose,
}) {

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    tipo: "",
    categoria: "",
    descricao: "",
    valor: "",
    data: "",
    observacao: "",
  });

  const [pendingTransactions, setPendingTransactions] = useState([]);

  function adicionarMovimentacao() {

    setPendingTransactions((prev) => [

      ...prev,

      {

        ...formData,

        id: crypto.randomUUID(),

        valor: parseCurrency(formData.valor),

        user_id: user.id,

      },

    ]);

    setFormData({

      tipo: "",
      categoria: "",
      descricao: "",
      valor: "",
      data: "",
      observacao: "",

    });

    setStep(1);

  }

  async function confirmarTudo() {

    const todas = [

      ...pendingTransactions,

    ];

    if (formData.descricao !== "") {

      todas.push({

        ...formData,

        id: crypto.randomUUID(),

        valor: parseCurrency(formData.valor),

        user_id: user.id,

      });

    }

    // garante que TODAS possuem dono
    const movimentacoes = todas.map((item) => ({

      ...item,

      user_id: user.id,

    }));

    const { error } = await supabase

      .from("transactions")

      .insert(movimentacoes);

    if (error) {

      console.error(error);

      return;

    }

    const { data } = await supabase

      .from("transactions")

      .select("*")

      .eq("user_id", user.id)

      .order("data", {
        ascending: false,
      });

    setTransactions(data);

    onClose();

  }

  return (

    <div>

      <h2>Nova Movimentação</h2>

      <p>Etapa {step} de 3</p>

      {step === 1 && (

        <WizardStepType
          formData={formData}
          setFormData={setFormData}
          setStep={setStep}
        />

      )}

      {step === 2 && (

        <WizardStepInfo
          formData={formData}
          setFormData={setFormData}
        />

      )}

      {step === 3 && (

        <WizardStepReview
          formData={formData}
          pendingTransactions={pendingTransactions}
          adicionarMovimentacao={adicionarMovimentacao}
          confirmarTudo={confirmarTudo}
        />

      )}

      <div className="wizard-buttons">

        {step > 1 && (

          <button
            onClick={() => setStep(step - 1)}
          >
            ⬅ Voltar
          </button>

        )}

        {step > 1 && step < 3 && (

          <button
            onClick={() => setStep(step + 1)}
          >
            Próximo ➜
          </button>

        )}

      </div>

    </div>

  );

}

export default ModalWizard;