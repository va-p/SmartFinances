import { BudgetProps } from '@interfaces/budget';

export type BudgetNavigationProps = {
  budget: BudgetProps;
};

export type EditBudgetNavigationProps = {
  id: string;
};

export type SubscriptionNavigationProps = {
  showHeader?: boolean;
};

type RootParamList = {
  Transações: undefined;
  Contas: undefined;
  'Todas as Contas': undefined;
  Conta: undefined;
  'Editar Conta': AccountNavigationProps;
  'Contas Conectadas': undefined;
  Orçamentos: undefined;
  'Todos os Orçamentos': undefined;
  Orçamento: BudgetNavigationProps;
  'Editar Orçamento': BudgetNavigationProps;
  Resumo: undefined;
  'Visão Geral': undefined;
  'Transações Por Categoria': undefined;
  Mais: undefined;
  'Mais Opções': undefined;
  Profile: undefined;
  Assinatura: SubscriptionNavigationProps;
  Categorias: undefined;
  Etiquetas: undefined;
  'Central de Ajuda': undefined;
  'Termos de Uso': undefined;
  'Politica de Privacidade': undefined;
};
