import api from '@api/api';

async function getAccounts(userID: string | null) {
  const { data } = await api.get('account', {
    params: {
      user_id: userID,
    },
  });

  return data;
}

export default getAccounts;
