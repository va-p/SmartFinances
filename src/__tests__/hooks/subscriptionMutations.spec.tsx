import React, { PropsWithChildren } from 'react';

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import api from '@api/api';
import {
  useDesignateSyncedSubscriptionMutation,
  useUpdateSyncedSubscriptionMutation,
} from '@hooks/useSubscriptionMutations';

jest.mock('@api/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), patch: jest.fn() },
}));

const postMock = api.post as jest.Mock;
const patchMock = api.patch as jest.Mock;
const seriesId = '7b386a1c-91ef-43ed-a9f4-fcf8a74f02db';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useDesignateSyncedSubscriptionMutation (SSI-01/SSI-06..08)', () => {
  it('posts the exact transaction designation payload and returns the series', async () => {
    postMock.mockResolvedValue({ data: { id: seriesId } });
    const queryClient = new QueryClient();
    const { result } = renderHook(
      () => useDesignateSyncedSubscriptionMutation(),
      { wrapper: createWrapper(queryClient) }
    );

    let series: { id: string } | undefined;
    await act(async () => {
      series = await result.current.mutateAsync(42);
    });

    expect(postMock).toHaveBeenCalledWith('subscription/synced/designate', {
      transaction_id: 42,
    });
    expect(series).toEqual({ id: seriesId });
  });

  it('invalidates subscriptions, detail, payments and transactions, but not accounts', async () => {
    postMock.mockResolvedValue({ data: { id: seriesId } });
    const queryClient = new QueryClient();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(
      () => useDesignateSyncedSubscriptionMutation(),
      { wrapper: createWrapper(queryClient) }
    );

    await act(async () => {
      await result.current.mutateAsync(42);
    });

    expect(invalidate).toHaveBeenCalledTimes(4);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['subscriptions'] });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['subscription', seriesId],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['subscription-payments'],
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['transactions'] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['accounts'] });
  });

  it('is pending until designation succeeds', async () => {
    const request = deferred<{ data: { id: string } }>();
    postMock.mockReturnValue(request.promise);
    const queryClient = new QueryClient();
    const { result } = renderHook(
      () => useDesignateSyncedSubscriptionMutation(),
      { wrapper: createWrapper(queryClient) }
    );

    let mutation!: Promise<{ id: string }>;
    act(() => {
      mutation = result.current.mutateAsync(42);
    });
    await waitFor(() => expect(result.current.isPending).toBe(true));

    await act(async () => {
      request.resolve({ data: { id: seriesId } });
      await mutation;
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  it('propagates designation failure without success invalidations', async () => {
    const failure = new Error('network unavailable');
    postMock.mockRejectedValue(failure);
    const queryClient = new QueryClient();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(
      () => useDesignateSyncedSubscriptionMutation(),
      { wrapper: createWrapper(queryClient) }
    );

    await act(async () => {
      await expect(result.current.mutateAsync(42)).rejects.toBe(failure);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(failure);
    expect(invalidate).not.toHaveBeenCalled();
  });
});

describe('useUpdateSyncedSubscriptionMutation (SSI-17/SSI-20)', () => {
  it('dismisses the whole series by UUID and invalidates its affected queries', async () => {
    patchMock.mockResolvedValue({ data: { success: true } });
    const queryClient = new QueryClient();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateSyncedSubscriptionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: seriesId,
        is_subscription: false,
      });
    });

    expect(patchMock).toHaveBeenCalledWith(`subscription/synced/${seriesId}`, {
      is_subscription: false,
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['subscriptions'] });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['subscription', seriesId],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['subscription-payments'],
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['transactions'] });
  });

  it('changes series visibility without changing its subscription state', async () => {
    patchMock.mockResolvedValue({ data: { success: true } });
    const queryClient = new QueryClient();
    const { result } = renderHook(() => useUpdateSyncedSubscriptionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: seriesId,
        hide_from_subscription_list: true,
      });
    });

    expect(patchMock).toHaveBeenCalledWith(`subscription/synced/${seriesId}`, {
      hide_from_subscription_list: true,
    });
  });

  it('tracks pending state and propagates series update failures', async () => {
    const request = deferred<{ data: { success: boolean } }>();
    patchMock.mockReturnValue(request.promise);
    const queryClient = new QueryClient();
    const { result } = renderHook(() => useUpdateSyncedSubscriptionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutation!: Promise<{ success: boolean }>;
    act(() => {
      mutation = result.current.mutateAsync({
        id: seriesId,
        hide_from_subscription_list: false,
      });
    });
    await waitFor(() => expect(result.current.isPending).toBe(true));

    const failure = new Error('update failed');
    await act(async () => {
      request.reject(failure);
      await expect(mutation).rejects.toBe(failure);
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.error).toBe(failure);
  });
});
