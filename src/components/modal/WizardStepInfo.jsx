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
    const [criandoCategoria, setCriandoCategoria] = useState(false);

    const categoriasPadrao =
        categorias[formData.tipo] || [];

    const categoriasUsuario = categories.filter(
        (c) => c.tipo === formData.tipo
    );

    const categoriaUsuarioSelecionada =
        categoriasUsuario.find(
            (c) => c.nome === formData.categoria
        );

    function selecionarCategoriaPadrao(valor) {
        setFormData((prev) => ({
            ...prev,
            categoria: valor,
        }));

        setCriandoCategoria(false);
    }

    function selecionarCategoriaUsuario(e) {
        const valor = e.target.value;

        if (valor === "__criar__") {
            setCriandoCategoria(true);

            setFormData((prev) => ({
                ...prev,
                categoria: "",
            }));

            return;
        }

        setCriandoCategoria(false);

        setFormData((prev) => ({
            ...prev,
            categoria: valor,
        }));
    }

    async function criarNovaCategoria() {
        const nome = novaCategoria.trim();

        if (!nome) {
            return;
        }

        try {
            await addCategory(nome, formData.tipo);

            setFormData((prev) => ({
                ...prev,
                categoria: nome,
            }));

            setNovaCategoria("");
            setCriandoCategoria(false);
        } catch (err) {
            console.error(
                "Erro ao criar categoria:",
                err
            );
        }
    }

    return (
        <div>

            <h2>
                {formData.tipo === "entrada" &&
                    "Nova Entrada"}

                {formData.tipo === "saida" &&
                    "Nova Saída"}

                {formData.tipo === "investimento" &&
                    "Novo Investimento"}

                {formData.tipo === "renda_passiva" &&
                    "Nova Renda Passiva"}
            </h2>

            <div className="category-section">

                {/* CATEGORIAS PADRÃO */}

                <span className="category-title">
                    Categorias padrão
                </span>

                <select
                    className="category-select"
                    value={
                        categoriasPadrao.includes(
                            formData.categoria
                        )
                            ? formData.categoria
                            : ""
                    }
                    onChange={(e) =>
                        selecionarCategoriaPadrao(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Categoria
                    </option>

                    {categoriasPadrao.map(
                        (categoria) => (
                            <option
                                key={`padrao-${categoria}`}
                                value={categoria}
                            >
                                {categoria}
                            </option>
                        )
                    )}
                </select>


                {/* MINHAS CATEGORIAS */}

                <span className="category-title">
                    Minhas categorias
                </span>

                <div className="custom-category-select">

                    <select
                        className="category-select"
                        value={
                            criandoCategoria
                                ? "__criar__"
                                : categoriaUsuarioSelecionada
                                    ? formData.categoria
                                    : ""
                        }
                        onChange={
                            selecionarCategoriaUsuario
                        }
                    >

                        <option value="">
                            Categoria
                        </option>

                        <option value="__criar__">
                            ＋ Criar categoria
                        </option>

                        {categoriasUsuario.map(
                            (categoria) => (
                                <option
                                    key={categoria.id}
                                    value={categoria.nome}
                                >
                                    {categoria.nome}
                                </option>
                            )
                        )}

                    </select>


                    {/* AÇÕES DA CATEGORIA */}

                    {categoriaUsuarioSelecionada &&
                        !criandoCategoria && (
                            <div className="category-actions">

                                <button
                                    type="button"
                                    onClick={() =>
                                        editarCategoria(
                                            categoriaUsuarioSelecionada
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
                                            categoriaUsuarioSelecionada
                                        )
                                    }
                                    title="Excluir"
                                >
                                    🗑️
                                </button>

                            </div>
                        )}

                </div>


                {/* CRIAR CATEGORIA */}

                {criandoCategoria && (
                    <div className="new-category">

                        <input
                            placeholder="Nome da categoria"
                            value={novaCategoria}
                            onChange={(e) =>
                                setNovaCategoria(
                                    e.target.value
                                )
                            }
                            autoFocus
                        />

                        <button
                            type="button"
                            onClick={
                                criarNovaCategoria
                            }
                        >
                            Adicionar
                        </button>

                    </div>
                )}

            </div>


            {/* DESCRIÇÃO */}

            <input
                placeholder="Descrição *"
                value={formData.descricao}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        descricao:
                            e.target.value,
                    })
                }
                required
            />


            {/* VALOR */}

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


            {/* DATA */}

            <input
                type="date"
                value={formData.data}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        data: e.target.value,
                    })
                }
            />


            {/* OBSERVAÇÃO */}

            <textarea
                placeholder="Observações"
                value={formData.observacao}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        observacao:
                            e.target.value,
                    })
                }
            />

        </div>
    );
}

export default WizardStepInfo;