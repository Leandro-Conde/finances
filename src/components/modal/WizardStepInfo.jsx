import { useState } from "react";
import CurrencyInput from "react-currency-input-field";

function WizardStepInfo({
    formData,
    setFormData,
    categories,
    addCategory,
}) {
    const categorias = {

        entrada: [
            "Salário",
            "Freelance",
            "Venda",
            "Presente",
            "Outros",
        ],

        saida: [
            "Mercado",
            "Moradia",
            "Transporte",
            "Saúde",
            "Lazer",
            "Educação",
            "Internet",
            "Outros",
        ],

        investimento: [
            "Tesouro",
            "CDB",
            "Ações",
            "ETF",
            "FII",
            "Bitcoin",
        ],

        renda_passiva: [
            "Dividendos",
            "Aluguel",
            "Juros",
            "Royalties",
        ],

    };

    const [novaCategoria, setNovaCategoria] = useState("");

    const categoriasPadrao = categorias[formData.tipo] || [];

    const categoriasUsuario = categories.filter(
        (c) => c.tipo === formData.tipo
    );
    
    const listaFinal = [
        ...categoriasPadrao,
        ...categoriasUsuario.map((c) => c.nome),
    ];

    

    return (

        <div>

            <h2>

                {formData.tipo === "entrada" && "Nova Entrada"}

                {formData.tipo === "saida" && "Nova Saída"}

                {formData.tipo === "investimento" && "Novo Investimento"}

                {formData.tipo === "renda_passiva" && "Nova Renda Passiva"}

            </h2>

            <select

                value={formData.categoria}

                onChange={(e) =>

                    setFormData({

                        ...formData,

                        categoria: e.target.value,

                    })

                }

            >

                <option value="">

                    Categoria

                </option>

                {listaFinal.map((categoria) => (

                    <option

                        key={categoria}

                        value={categoria}

                    >

                        {categoria}

                    </option>

                ))}

            </select>

            <div className="new-category">

    <input

        placeholder="Nova categoria"

        value={novaCategoria}

        onChange={(e)=>setNovaCategoria(e.target.value)}

    />

    <button

        type="button"

        onClick={async()=>{

            if(!novaCategoria.trim()) return;

            await addCategory(novaCategoria, formData.tipo);

            setFormData((prev) => ({
            
                ...prev,
            
                categoria: novaCategoria,
            
            }));
            
            setNovaCategoria("");

            setNovaCategoria("");

        }}

    >

        Adicionar

    </button>

</div>

            <input

                placeholder="Descrição"

                value={formData.descricao}

                onChange={(e)=>

                    setFormData({

                        ...formData,

                        descricao:e.target.value,

                    })

                }

            />

        <CurrencyInput
            placeholder="Valor"

            prefix="R$ "

            decimalsLimit={2}

            decimalSeparator=","

            groupSeparator="."

            value={formData.valor}

            onValueChange={(value) =>
                setFormData({
                    ...formData,
                    valor: value || "",
                })
            }

            className="currency-input"
        />

            <input

                type="date"

                value={formData.data}

                onChange={(e)=>

                    setFormData({

                        ...formData,

                        data:e.target.value,

                    })

                }

            />

            <textarea

                placeholder="Observações"

                value={formData.observacao}

                onChange={(e)=>

                    setFormData({

                        ...formData,

                        observacao:e.target.value,

                    })

                }

            />

        </div>

    );

}

export default WizardStepInfo;