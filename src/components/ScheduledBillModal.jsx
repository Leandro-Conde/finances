import { useEffect, useState } from "react";

function ScheduledBillModal({
    bill,
    onSave,
    onClose,
}) {

    const [form, setForm] = useState({
        nome: "",
        categoria: "",
        valor: "",
        tipo: "saida",
        vencimento: "",
        recorrencia: "mensal",
        dias_lembrete: 3,
        ativo: true,
    });

    useEffect(() => {

        if (!bill) {

            setForm({
                nome: "",
                categoria: "",
                valor: "",
                tipo: "saida",
                vencimento: "",
                recorrencia: "mensal",
                dias_lembrete: 3,
                ativo: true,
            });

            return;

        }

        setForm({
            nome: bill.nome || "",
            categoria: bill.categoria || "",
            valor: bill.valor || "",
            tipo: bill.tipo || "saida",
            vencimento: bill.vencimento || "",
            recorrencia: bill.recorrencia || "mensal",
            dias_lembrete: bill.dias_lembrete ?? 3,
            ativo: bill.ativo ?? true,
        });

    }, [bill]);

    function handleChange(event) {

        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value,
        });

    }

    async function salvar() {

        if (!form.nome.trim()) {
            alert("Informe o nome da conta.");
            return;
        }

        if (!form.valor) {
            alert("Informe o valor.");
            return;
        }

        if (!form.vencimento) {
            alert("Informe o vencimento.");
            return;
        }

        if (!form.categoria.trim()) {
            alert("Informe a categoria.");
            return;
        }

        await onSave({
            ...bill,
            ...form,
            valor: Number(form.valor),
            dias_lembrete: Number(form.dias_lembrete),
        });

    }

    return (
        <div>

            <h2>
                {bill ? "Editar conta" : "Nova conta"}
            </h2>

            <input
                name="nome"
                placeholder="Nome da conta"
                value={form.nome}
                onChange={handleChange}
            />

            <input
                name="categoria"
                placeholder="Categoria"
                value={form.categoria}
                onChange={handleChange}
            />

            <input
                name="valor"
                type="number"
                step="0.01"
                placeholder="Valor"
                value={form.valor}
                onChange={handleChange}
            />

            <label>
                Tipo
            </label>

            <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
            >

                <option value="saida">
                    Saída
                </option>

                <option value="entrada">
                    Entrada
                </option>

            </select>

            <label>
                Vencimento
            </label>

            <input
                name="vencimento"
                type="date"
                value={form.vencimento}
                onChange={handleChange}
            />

            <label>
                Recorrência
            </label>

            <select
                name="recorrencia"
                value={form.recorrencia}
                onChange={handleChange}
            >

                <option value="unica">
                    Única
                </option>

                <option value="mensal">
                    Mensal
                </option>

            </select>

            <label>
                Lembrar com antecedência
            </label>

            <select
                name="dias_lembrete"
                value={form.dias_lembrete}
                onChange={handleChange}
            >

                <option value="1">
                    1 dia antes
                </option>

                <option value="3">
                    3 dias antes
                </option>

                <option value="5">
                    5 dias antes
                </option>

                <option value="7">
                    7 dias antes
                </option>

            </select>

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

export default ScheduledBillModal;