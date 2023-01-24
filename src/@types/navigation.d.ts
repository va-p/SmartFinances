export type AccountNavigationProps = {
  id: string;
}

export type EditAccountNavigationProps = {
  id: string;
}

type RootParamList = {
  Timeline: undefined;
  Contas: undefined;
  Resumo: undefined;
  Mais: undefined;
  Menu: undefined;
  Categorias: undefined;
  'Central de Ajuda': undefined;
  'Termos de Uso': undefined;
  'Politica de Privacidade': undefined;
  'Todas as Contas': undefined;
  Conta: AccountNavigationProps;
  'Editar Conta': EditAccountNavigationProps;
}