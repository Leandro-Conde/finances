# Atlas Finance

## Sprint 01 — Fundação do Projeto

### Data

(Preencher)

---

## Objetivo

Construir a estrutura inicial do Atlas Finance, definindo a arquitetura do projeto, os primeiros componentes React e o funcionamento básico do gerenciamento financeiro.

---

## Funcionalidades implementadas

### Dashboard

- Exibição do saldo atual.
- Cálculo automático de entradas.
- Cálculo automático de saídas.

---

### Gerenciamento de Transações

Foi desenvolvido o primeiro CRUD parcial contendo:

- Cadastro de transações.
- Listagem das transações.
- Exclusão de transações.

Cada movimentação contém:

- Descrição
- Valor
- Categoria
- Tipo
- Data
- Observação

---

### Modal

O formulário de cadastro passou a funcionar através de um componente Modal reutilizável.

Benefícios:

- Interface mais limpa.
- Melhor experiência do usuário.
- Estrutura preparada para reutilização na edição de transações.

---

### Componentização

A aplicação foi reorganizada em componentes independentes.

Estrutura atual:

src/
components/
- Header
- Dashboard
- TransactionForm
- TransactionList
- TransactionItem
- Modal

utils/
- formatCurrency.js

data/
- mockData.js

---

### Melhorias de arquitetura

- Separação de responsabilidades entre componentes.
- Estado centralizado no App.jsx.
- Comunicação entre componentes via props.
- Funções reutilizáveis.
- Formatação monetária centralizada em utilitário.

---

### Tecnologias

- React
- Vite
- UUID
- CSS

---

### Status do projeto

Concluído:

- Dashboard
- Cadastro de transações
- Exclusão de transações
- Modal
- Componentização
- Organização da arquitetura

Em desenvolvimento:

- Edição de transações
- Gráficos financeiros
- Estatísticas
- Filtros

---

## Próxima Sprint

Objetivo da Sprint 02:

- Implementar gráficos financeiros.
- Criar filtros por período.
- Finalizar edição de transações.
- Aprimorar o Dashboard.