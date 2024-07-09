import api from '@api/api';

async function getAccounts(tenantId: string | null) {
  const { data } = await api.get('account', {
    params: {
      tenant_id: tenantId,
    },
  });

  return data;
}

export default getAccounts;
