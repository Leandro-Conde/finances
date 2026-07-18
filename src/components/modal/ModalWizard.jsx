import { useState, useEffect } from "react";

import WizardStepType from "./WizardStepType";
import WizardStepInfo from "./WizardStepInfo";
import WizardStepReview from "./WizardStepReview";

import { supabase } from "../../services/supabase";
import { parseCurrency } from "../../utils/parseCurrency";

import {

  getCategories,

  createCategory,

  /*deleteCategory,*/

} from "../../services/categoryService";

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
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {

    

    if (!user) return;

    loadCategories();

}, [user]);

   function validarFormulario() {

      if (!formData.categoria) return "Selecione uma categoria.";

      if (!formData.descricao.trim()) return "Informe uma descrição.";

      if (!formData.valor) return "Informe um valor.";

      if (!formData.data) return "Informe uma data.";

      return null;

    }

async function loadCategories() {

  try {

      const data = await getCategories(user.id);

      setCategories(data);

  } catch (err) {

      console.error(err);

  }

}

async function addCategory(nome, tipo) {

  try {

      await createCategory({

          nome,
          tipo,
          prioridade: false,
          user_id: user.id,

      });

      await loadCategories();

  } catch (err) {

      console.error(err);

  }

}

async function confirmarTudo() {

  const erro = validarFormulario();

  if (erro) {

      alert(erro);

      return;

  }

  const todas = [...pendingTransactions];

  todas.push({

      ...formData,

      id: crypto.randomUUID(),

      valor: parseCurrency(formData.valor),

      user_id: user.id,

  });

}

  async function confirmarTudo() {

    const todas = [

      ...pendingTransactions,

    ];

    if (!formData.descricao.trim()) {

      alert("Descrição obrigatória.");
  
      return;
  
  }

      todas.push({

        ...formData,

        id: crypto.randomUUID(),

        valor: parseCurrency(formData.valor),

        user_id: user.id,

      });


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

  console.log("Categorias do Modal:", categories);

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
      categories={categories}
      addCategory={addCategory}
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
    onClick={() => {

        if(step === 2){

            if(!formData.categoria){

                alert("Selecione uma categoria.");

                return;

            }

            if(!formData.descricao.trim()){

                alert("Informe uma descrição.");

                return;

            }

            if(!formData.valor){

                alert("Informe um valor.");

                return;

            }

            if(!formData.data){

                alert("Informe uma data.");

                return;

            }

        }

        setStep(step + 1);

    }}
    >

    Próximo ➜

    </button>

        )}

      </div>

    </div>

  );

}

export default ModalWizard;