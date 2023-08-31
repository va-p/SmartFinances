export type AccountNavigationProps = {
  id: string;
};

export type EditAccountNavigationProps = {
  id: string;
};

export type BudgetNavigationProps = {
  id: string;
};

export type EditBudgetNavigationProps = {
  id: string;
};

export type TransactionsByCategoryNavigationProps = {
  id: string;
};

type RootParamList = {
  Timeline: undefined;
  Contas: undefined;
  'Todas as Contas': undefined;
  Conta: AccountNavigationProps;
  'Editar Conta': EditAccountNavigationProps;
  Orçamentos: undefined;
  'Todos os Orçamentos': undefined;
  Orçamento: BudgetNavigationProps;
  'Editar Orçamento': EditBudgetNavigationProps;
  Resumo: undefined;
  'Visão Geral das Despesas': undefined;
  'Visão Geral das Receitas': undefined;
  'Transações Por Categoria': ExpensesByCategoryNavigationProps;

  Mais: undefined;
  'Mais Opções': undefined;
  Categorias: undefined;
  Etiquetas: undefined;
  'Central de Ajuda': undefined;
  'Termos de Uso': undefined;
  'Politica de Privacidade': undefined;
};
