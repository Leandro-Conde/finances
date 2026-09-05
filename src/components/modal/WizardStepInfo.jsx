import { useState } from "react";
import CurrencyInput from "react-currency-input-field";

function WizardStepInfo({
    formData,
    setFormData,
    categories,
    addCategory,
    editarCategoria,
    removerCategoria,
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

    

    return (

        <div>

            <h2>

                {formData.tipo === "entrada" && "Nova Entrada"}

                {formData.tipo === "saida" && "Nova Saída"}

                {formData.tipo === "investimento" && "Novo Investimento"}

                {formData.tipo === "renda_passiva" && "Nova Renda Passiva"}

            </h2>

            <div className="category-section">

<span className="category-title">
    Categorias padrão
</span>

<select
    className="category-select"
    value={
        categoriasPadrao.includes(formData.categoria)
            ? formData.categoria
            : ""
    }
    onChange={(e) =>
        setFormData({
            ...formData,
            categoria: e.target.value,
        })
    }
>
    <option value="">Categoria</option>

    {categoriasPadrao.map((categoria) => (
        <option
            key={`padrao-${categoria}`}
            value={categoria}
        >
            {categoria}
        </option>
    ))}
</select>


{categoriasUsuario.length > 0 && (
    <>
        <span className="category-title">
            Minhas categorias
        </span>

        <div className="custom-category-select">

            <select
                className="category-select"
                value={
                    categoriasUsuario.some(
                        (c) => c.nome === formData.categoria
                    )
                        ? formData.categoria
                        : ""
                }
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

                {categoriasUsuario.map((categoria) => (
                    <option
                        key={categoria.id}
                        value={categoria.nome}
                    >
                        {categoria.nome}
                    </option>
                ))}
            </select>

            {categoriasUsuario.some(
                (c) => c.nome === formData.categoria
            ) && (
                <div className="category-actions">
                    {(() => {
                        const selecionada =
                            categoriasUsuario.find(
                                (c) =>
                                    c.nome ===
                                    formData.categoria
                            );

                        return (
                            <>
                                <button
                                    type="button"
                                    onClick={() =>
                                        editarCategoria(
                                            selecionada
                                        )
                                    }
                                    title="Editar"
                                >
                                    ✏️
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removerCategoria(
                                            selecionada
                                        )
                                    }
                                    title="Excluir"
                                >
                                    🗑️
                                </button>
                            </>
                        );
                    })()}
                </div>
            )}

        </div>
    </>
)}


<div className="new-category">

    <input
        placeholder="Nova categoria"
        value={novaCategoria}
        onChange={(e) =>
            setNovaCategoria(e.target.value)
        }
    />

    <button
        type="button"
        onClick={async () => {
            if (!novaCategoria.trim()) return;

            await addCategory(
                novaCategoria.trim(),
                formData.tipo
            );

            setFormData((prev) => ({
                ...prev,
                categoria: novaCategoria.trim(),
            }));

            setNovaCategoria("");
        }}
    >
        Adicionar
    </button>

</div>

</div>

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

        }}

    >

        Adicionar

    </button>

</div>

        <input
            placeholder="Descrição *"
            value={formData.descricao}
            onChange={(e)=>

                setFormData({

                    ...formData,

                    descricao:e.target.value,

                })

            }

            required
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