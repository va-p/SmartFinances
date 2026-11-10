// The 9 home-screen widget entries (spec sizes). Drives the Android manifest
// receivers, the res/xml descriptors, and the iOS supported families.
// Native UI code (T8/T9) fills in rendering; this file owns the size contract.
const APP_GROUP_ID = 'group.com.vap.smartfinances.widgets';

const WIDGET_SIZES = {
  small: { minWidth: '110dp', minHeight: '110dp', targetCellWidth: 2, targetCellHeight: 2 },
  medium: { minWidth: '250dp', minHeight: '110dp', targetCellWidth: 4, targetCellHeight: 2 },
  large: { minWidth: '250dp', minHeight: '250dp', targetCellWidth: 4, targetCellHeight: 4 },
};

const WIDGET_PROVIDERS = [
  { name: 'budgets_medium', title: 'Orçamentos', size: 'medium', family: 'budgets' },
  { name: 'budgets_large', title: 'Orçamentos', size: 'large', family: 'budgets' },
  { name: 'cashflow_small', title: 'Fluxo de Caixa', size: 'small', family: 'cashflow' },
  { name: 'cashflow_medium', title: 'Fluxo de Caixa', size: 'medium', family: 'cashflow' },
  { name: 'overview_small', title: 'Overview', size: 'small', family: 'overview' },
  { name: 'control_medium', title: 'Overview', size: 'medium', family: 'control' },
  { name: 'control_large', title: 'Painel de Controle', size: 'large', family: 'control' },
  { name: 'patrimony_small', title: 'Patrimônio', size: 'small', family: 'patrimony' },
  { name: 'patrimony_medium', title: 'Patrimônio', size: 'medium', family: 'patrimony' },
];

function toClassName(name) {
  return name
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function getWidgetProviders() {
  return WIDGET_PROVIDERS.map((provider) => ({
    ...provider,
    ...WIDGET_SIZES[provider.size],
    className: `.widgets.${toClassName(provider.name)}WidgetProvider`,
    xmlResource: `@xml/widget_info_${provider.name}`,
  }));
}

module.exports = { APP_GROUP_ID, WIDGET_PROVIDERS, getWidgetProviders };
