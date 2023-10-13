import api from '@api/api';

async function getTransactions(tenantId: number | null) {
  const { data } = await api.get('transaction', {
    params: {
      tenant_id: tenantId,
    },
  });

  return data;
}

export default getTransactions;
