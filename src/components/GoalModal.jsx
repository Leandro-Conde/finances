import { useState, useEffect } from "react";

function GoalModal({ goal, onSave, onClose }) {

    const [form, setForm] = useState({

        nome: "",
        valor_meta: "",
        valor_inicial: "",
        prazo_meses: "",

    });

    useEffect(() => {

        if (!goal) return;

        setForm({

            nome: goal.nome || "",
            valor_meta: goal.valor_meta || "",
            valor_inicial: goal.valor_inicial || "",
            prazo_meses: goal.prazo_meses || "",

        });

    }, [goal]);

    function handleChange(e) {

        setForm({

            ...form,
            [e.target.name]: e.target.value,

        });

    }

    function salvar() {

        if (!form.nome.trim()) {

            alert("Informe o nome da meta.");
            return;

        }

        if (!form.valor_meta) {

            alert("Informe o valor da meta.");
            return;

        }

        if (!form.prazo_meses) {

            alert("Informe o prazo.");
            return;

        }

        onSave({

            ...goal,
            ...form,

        });

    }

    return (

        <div>

            <h2>Nova Meta</h2>

            <input
                name="nome"
                placeholder="Nome da meta"
                value={form.nome}
                onChange={handleChange}
            />

            <input
                name="valor_meta"
                type="number"
                placeholder="Valor desejado"
                value={form.valor_meta}
                onChange={handleChange}
            />

            <input
                name="valor_inicial"
                type="number"
                placeholder="Valor atual"
                value={form.valor_inicial}
                onChange={handleChange}
            />

            <input
                name="prazo_meses"
                type="number"
                placeholder="Prazo (meses)"
                value={form.prazo_meses}
                onChange={handleChange}
            />

            <div className="wizard-buttons">

                <button onClick={onClose}>
                    Cancelar
                </button>

                <button onClick={salvar}>
                    Salvar
                </button>

            </div>

        </div>

    );

}

export default GoalModal;