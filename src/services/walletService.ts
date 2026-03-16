import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type { PageQuery, SpringPage } from '@/types/api';
import type { WalletBalanceDto, WalletTopUpRequestDto, WalletTransactionDto } from '@/types/wallet';
import api from './api';
import { withPageQuery } from './queryParams';

export const walletService = {
  async getMyWallet(): Promise<WalletBalanceDto> {
    const { data } = await api.get<WalletBalanceDto>(API_ENDPOINTS.wallet.root);
    return data;
  },

  async topUp(payload: WalletTopUpRequestDto): Promise<WalletBalanceDto> {
    const { data } = await api.post<WalletBalanceDto>(API_ENDPOINTS.wallet.topUp, payload);
    return data;
  },

  async getMyTransactions(page?: PageQuery): Promise<SpringPage<WalletTransactionDto>> {
    const { data } = await api.get<SpringPage<WalletTransactionDto>>(API_ENDPOINTS.wallet.transactions, {
      params: withPageQuery(page),
    });
    return data;
  },

  async getTopUpOptions(): Promise<number[]> {
    const { data } = await api.get<number[]>(API_ENDPOINTS.wallet.topUpOptions);
    return data;
  },
};
