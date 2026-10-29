import React from 'react';

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components';
import { format, parseISO } from 'date-fns';

import lightTheme from '@themes/lightTheme';
import { ExpiryNoticeModal } from '@components/ExpiryNoticeModal';
import { useBenefits } from '@stores/benefitsStorage';
import api from '@api/api';

const mockNavigate = jest.fn();

// Hoisted above the imports by jest.
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}));

jest.mock('@api/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const mockedGet = api.get as unknown as jest.Mock;
const mockedPost = api.post as unknown as jest.Mock;

const renderWithTheme = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <ExpiryNoticeModal />
    </ThemeProvider>
  );

const PENDING_NOTICE = {
  state: 'PENDING' as const,
  message:
    'Your plan no longer covers your current usage: connected accounts become read-only and stop syncing, and images above the free storage limit will be deleted after the grace period.',
  grace_deadline: '2026-11-28T00:00:00.000Z',
};

const setNotice = (notice: typeof PENDING_NOTICE | null) =>
  useBenefits.setState(() => ({ notice }));

// BEN-41/42/43 — the blocking expiry notice
describe('ExpiryNoticeModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setNotice(null);
  });

  // BEN-41 — no pending notice, no modal
  it('renders nothing while no notice is pending', () => {
    setNotice(null);
    const screen = renderWithTheme();

    expect(screen.queryByTestId('expiry-notice-card')).toBeNull();
  });

  it('renders nothing once the notice has been acknowledged', () => {
    setNotice({ ...PENDING_NOTICE, state: 'ACKNOWLEDGED' });
    const screen = renderWithTheme();

    expect(screen.queryByTestId('expiry-notice-card')).toBeNull();
  });

  // BEN-41 — blocking modal with the consequence text while PENDING
  it('renders the blocking modal with the consequence text while PENDING', () => {
    setNotice(PENDING_NOTICE);
    const screen = renderWithTheme();

    expect(screen.getByTestId('expiry-notice-card')).toBeTruthy();
    // Consequences: read-only accounts, sync stop, image deletion (BEN-24 text)
    expect(screen.getByText(/read-only and stop syncing/i)).toBeTruthy();
    expect(screen.getByText(/deleted after the grace period/i)).toBeTruthy();
    // Grace deadline surfaced as the user's local dd/MM/yyyy date
    const expectedDeadline = format(
      parseISO(PENDING_NOTICE.grace_deadline),
      'dd/MM/yyyy'
    );
    expect(screen.getByTestId('expiry-notice-deadline').props.children).toContain(
      expectedDeadline
    );
  });

  // BEN-43 — renew navigates to the existing paywall
  it('navigates to the subscription paywall when Renew is pressed', () => {
    setNotice(PENDING_NOTICE);
    const screen = renderWithTheme();

    fireEvent.press(screen.getByTestId('expiry-notice-renew'));

    expect(mockNavigate).toHaveBeenCalledWith('/options/subscription');
  });

  // BEN-42 — acknowledge calls the endpoint and dismisses the modal
  it('calls the acknowledge endpoint and dismisses the modal on Acknowledge', async () => {
    setNotice(PENDING_NOTICE);
    const screen = renderWithTheme();

    mockedPost.mockResolvedValue({ data: { success: true } });
    mockedGet.mockResolvedValue({
      data: {
        plan: { tier: 1, code: 'STARTER', name: 'Starter' },
        limits: { image_storage_bytes: 52_428_800, connections: 0 },
        usage: { image_storage_bytes: 0, connections: 1 },
        premium: false,
        notice: null, // acknowledged — no longer pending
        restricted_integration_ids: [7],
      },
    });

    fireEvent.press(screen.getByTestId('expiry-notice-acknowledge'));

    await waitFor(() => {
      expect(screen.queryByTestId('expiry-notice-card')).toBeNull();
    });
    expect(mockedPost).toHaveBeenCalledWith('/benefits/acknowledge');
    // Dismissal came from the refetched state, not a local shortcut.
    expect(mockedGet).toHaveBeenCalledWith('/benefits/me');
    expect(useBenefits.getState().notice).toBeNull();
  });
});
