
import { useState, useEffect } from "react";

function GoalModal({ goal, onSave, onClose }) {
    const [form, setForm] = useState({
        nome: "Investimentos/Guardados",
        valor_meta: "",
        valor_inicial: "",
        prazo_meses: "",
    });

    useEffect(() => {
        if (!goal) {
            setForm({
                nome: "Investimentos/Guardados",
                valor_meta: "",
                valor_inicial: "",
                prazo_meses: "",
            });
            return;
        }

        setForm({
            nome: goal.nome || "Investimentos/Guardados",
            valor_meta: goal.valor_meta || "",
            valor_inicial: goal.valor_inicial || "",
            prazo_meses: goal.prazo_meses || "",
        });
    }, [goal]);

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    }

    function salvar() {
        if (!form.nome.trim()) {
            alert("Informe o nome da meta.");
            return;
        }

        if (!form.valor_meta || Number(form.valor_meta) <= 0) {
            alert("Informe um valor-alvo maior que zero.");
            return;
        }

        if (!form.prazo_meses || Number(form.prazo_meses) <= 0) {
            alert("Informe um prazo válido em meses.");
            return;
        }

        onSave({
            ...goal,
            ...form,
            nome: "Investimentos/Guardados",
            valor_meta: Number(form.valor_meta),
            valor_inicial: Number(form.valor_inicial || 0),
            prazo_meses: Number(form.prazo_meses),
        });
    }

    return (
        <div>
            <h2>Investimentos/Guardados</h2>

            <p>
                Defina quanto deseja acumular e em quanto tempo pretende
                alcançar esse objetivo.
            </p>

            <label htmlFor="nome-meta">
                Nome da meta
            </label>
            <input
                id="nome-meta"
                name="nome"
                placeholder="Investimentos/Guardados"
                value={form.nome}
                onChange={handleChange}
                readOnly
            />

            <label htmlFor="valor-meta">
                Valor-alvo (R$)
            </label>
            <input
                id="valor-meta"
                name="valor_meta"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex.: 5000"
                value={form.valor_meta}
                onChange={handleChange}
                required
            />

            <label htmlFor="valor-inicial">
                Valor inicial já acumulado (R$)
            </label>
            <input
                id="valor-inicial"
                name="valor_inicial"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex.: 0"
                value={form.valor_inicial}
                onChange={handleChange}
            />

            <label htmlFor="prazo-meses">
                Prazo (meses)
            </label>
            <input
                id="prazo-meses"
                name="prazo_meses"
                type="number"
                min="1"
                step="1"
                placeholder="Ex.: 12"
                value={form.prazo_meses}
                onChange={handleChange}
                required
            />

            <div className="wizard-buttons">
                <button type="button" onClick={onClose}>
                    Cancelar
                </button>

                <button type="button" onClick={salvar}>
                    Salvar
                </button>
            </div>
        </div>
    );
}

export default GoalModal;
