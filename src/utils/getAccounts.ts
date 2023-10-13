import api from '@api/api';

async function getAccounts(tenantId: number | null) {
  const { data } = await api.get('account', {
    params: {
      tenant_id: tenantId,
    },
  });

  return data;
}

export default getAccounts;
