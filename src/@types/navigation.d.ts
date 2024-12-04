import { BudgetProps } from '@interfaces/budget';

export type AccountNavigationProps = {
  id: string;
};

export type BudgetNavigationProps = {
  budget: BudgetProps;
};

export type EditBudgetNavigationProps = {
  id: string;
};

type RootParamList = {
  Timeline: undefined;
  Contas: undefined;
  'Todas as Contas': undefined;
  Conta: AccountNavigationProps;
  'Editar Conta': AccountNavigationProps;
  Orçamentos: undefined;
  'Todos os Orçamentos': undefined;
  Orçamento: BudgetNavigationProps;
  'Editar Orçamento': BudgetNavigationProps;
  Resumo: undefined;
  'Visão Geral': undefined;
  'Transações Por Categoria': undefined;
  Mais: undefined;
  'Mais Opções': undefined;
  Categorias: undefined;
  Etiquetas: undefined;
  'Central de Ajuda': undefined;
  'Termos de Uso': undefined;
  'Politica de Privacidade': undefined;
};
