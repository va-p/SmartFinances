import { BudgetProps } from '@interfaces/budget';
import { BankingIntegration } from '@interfaces/bankingIntegration';

export type AccountNavigationProps = {
  budget: BudgetProps;
};

export type BudgetNavigationProps = {
  budget: BudgetProps;
};

export type EditBudgetNavigationProps = {
  id: string;
};

export type SubscriptionNavigationProps = {
  showHeader?: boolean;
};

export type BankingIntegrationNavigationProps = {
  bankingIntegration: BankingIntegration;
  connectToken: string;
};

type RootParamList = {
  Transações: undefined;
  Contas: undefined;
  'Todas as Contas': undefined;
  Conta: undefined;
  'Editar Conta': AccountNavigationProps;
  'Contas Conectadas': undefined;
  'Integração Bancária': BankingIntegrationNavigationProps;
  Orçamentos: undefined;
  'Todos os Orçamentos': undefined;
  Orçamento: BudgetNavigationProps;
  'Editar Orçamento': BudgetNavigationProps;
  Resumo: undefined;
  'Visão Geral': undefined;
  'Transações Por Categoria': undefined;
  Mais: undefined;
  'Mais Opções': undefined;
  Perfil: undefined;
  Assinatura: SubscriptionNavigationProps;
  Categorias: undefined;
  Etiquetas: undefined;
};
