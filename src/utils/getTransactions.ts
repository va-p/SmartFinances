import api from '@api/api';

async function getTransactions(userID: string): Promise<any[]> {
  const { data } = await api.get('transaction', {
    params: {
      user_id: userID,
    },
  });

  return data;
}

export default getTransactions;
