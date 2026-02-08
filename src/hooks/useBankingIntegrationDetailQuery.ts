import { useQuery } from '@tanstack/react-query';

import api from '@api/api';

import { BankingIntegration } from '@interfaces/bankingIntegration';

const fetchBankingIntegrationDetail = async (
  bankingIntegrationID: string
): Promise<BankingIntegration> => {
  const { data } = await api.get('banking_integration/single', {
    params: { banking_integration_id: bankingIntegrationID },
  });
  return data;
};

export function useBankingIntegrationDetailQuery(bankingIntegrationID: string) {
  return useQuery({
    queryKey: ['bankingIntegration', bankingIntegrationID],
    queryFn: () => fetchBankingIntegrationDetail(bankingIntegrationID),
    enabled: !!bankingIntegrationID,
  });
}
