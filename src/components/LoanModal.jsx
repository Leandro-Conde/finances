import { useState } from "react";

function LoanModal({ onSave, onClose }) {

    const [form, setForm] = useState({

        tipo: "pagar",
        pessoa: "",
        descricao: "",
        valor: "",
        vencimento: "",

    });

    function handleChange(e){

        setForm({

            ...form,

            [e.target.name]:e.target.value,

        });

    }

    function salvar(){

        if(!form.pessoa || !form.valor){

            alert("Preencha os campos obrigatórios.");
            return;

        }

        onSave(form);

    }

    return(

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