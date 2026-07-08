# Sprint 02 - Dashboard Inteligente

## Objetivo
Evoluir o Dashboard para uma arquitetura escalável e preparada para integração com banco de dados.

## Implementado

- Dashboard separado da lógica de cálculo.
- Criação do utilitário `dashboardMetrics.js`.
- Cards de:
  - Saldo
  - Entradas
  - Saídas
  - Investimentos
  - Renda Passiva
  - Economia
  - Teto de Gastos
- Gráfico financeiro integrado com Recharts.
- Modal para cadastro de transações.
- Exclusão de transações.
- Cadastro utilizando UUID.

## Refatoração

Foi criado o componente reutilizável `MetricCard`, eliminando repetição de código e facilitando futuras melhorias visuais.

## Próximos passos

- Ícones nos cards.
- Barras de progresso.
- Indicadores de tendência.
- Teto de gastos visual.
- Dashboard animado.
- Integração com Supabase.