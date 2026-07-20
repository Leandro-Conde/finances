import { useState, useEffect } from "react";

function LoanModal({

    loan,

    onSave,

    onClose,

}) {

    const [form, setForm] = useState({

        status: loan?.status || "pendente",
    
        tipo: loan?.tipo || "pagar",
    
        pessoa: loan?.pessoa || "",
    
        descricao: loan?.descricao || "",
    
        observacao: loan?.observacao || "",
    
        valor: loan?.valor || "",
    
        vencimento: loan?.vencimento || "",
    
        prioridade: loan?.prioridade || "media",
    
    });

    useEffect(() => {

        if (!loan) return;
    
        setForm({
    
            status: loan.status,
    
            tipo: loan.tipo,
    
            pessoa: loan.pessoa,
    
            descricao: loan.descricao,
    
            observacao: loan.observacao,
    
            valor: loan.valor,
    
            vencimento: loan.vencimento,
    
            prioridade: loan.prioridade,
    
        });
    
    }, [loan]);

    function handleChange(e) {

        setForm({

            ...form,

            [e.target.name]: e.target.value,

        });

    }

    function salvar() {

        if (!form.pessoa.trim()) {

            alert("Informe a pessoa.");

            return;

        }

        if (!form.descricao.trim()) {

            alert("Informe uma descrição.");

            return;

        }

        if (!form.valor) {

            alert("Informe um valor.");

            return;

        }

        if (!form.vencimento) {

            alert("Informe uma data.");

            return;

        }

        onSave({

            ...loan,
        
            ...form,
        
        });

    }

    return (

        <div>

            <h2>Novo Empréstimo</h2>

            <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
            >

                <option value="pagar">

                    Vou pagar

                </option>

                <option value="receber">

                    Vou receber

                </option>

            </select>

            <input
                name="pessoa"
                placeholder="Pessoa"
                value={form.pessoa}
                onChange={handleChange}
            />

            <input
                name="descricao"
                placeholder="Descrição"
                value={form.descricao}
                onChange={handleChange}
            />

            <textarea
                name="observacao"
                placeholder="Observações (opcional)"
                value={form.observacao}
                onChange={handleChange}
            />

            <input
                name="valor"
                type="number"
                placeholder="Valor"
                value={form.valor}
                onChange={handleChange}
            />

            <input
                name="vencimento"
                type="date"
                value={form.vencimento}
                onChange={handleChange}
            />

            <select
                name="prioridade"
                value={form.prioridade}
                onChange={handleChange}
            >

                <option value="baixa">

                    Baixa

                </option>

                <option value="media">

                    Média

                </option>

                <option value="alta">

                    Alta

                </option>

            </select>

            <select
                name="status"
                value={form.status}
                onChange={handleChange}
            >

                <option value="pendente">

                    Pendente

                </option>

                <option value="pago">

                    Quitado

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

export default LoanModal;