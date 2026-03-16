import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletService } from '@/services/walletService';
import type { PageQuery } from '@/types/api';
import type { WalletTopUpRequestDto } from '@/types/wallet';
import { queryKeys } from '@/api/queryKeys';

const TOP_UP_OPTIONS_STALE_TIME_MS = 15 * 60_000;
const TOP_UP_OPTIONS_GC_TIME_MS = 60 * 60_000;

export const useWalletBalanceQuery = () =>
  useQuery({
    queryKey: queryKeys.wallet.balance(),
    queryFn: () => walletService.getMyWallet(),
  });

export const useWalletTransactionsQuery = (page?: PageQuery) =>
  useQuery({
    queryKey: queryKeys.wallet.transactions(page),
    queryFn: () => walletService.getMyTransactions(page),
  });

export const useWalletTopUpOptionsQuery = () =>
  useQuery({
    queryKey: queryKeys.wallet.topUpOptions(),
    queryFn: () => walletService.getTopUpOptions(),
    staleTime: TOP_UP_OPTIONS_STALE_TIME_MS,
    gcTime: TOP_UP_OPTIONS_GC_TIME_MS,
  });

export const useWalletTopUpMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WalletTopUpRequestDto) => walletService.topUp(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet.transactions() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
    },
  });
};
