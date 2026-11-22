import { useCurrentAccountSelected } from '@stores/currentAccountSelectedStorage';

describe('useCurrentAccountSelected investment group payload (INV-03)', () => {
  beforeEach(() => {
    useCurrentAccountSelected.setState(() => ({
      accountId: null,
      accountName: null,
      accountGroupKey: null,
      accountGroupMemberIds: null,
    }));
  });

  // INV-03 — group navigation state defaults to null (single mode).
  it('defaults the group payload to null', () => {
    expect(useCurrentAccountSelected.getState().accountGroupKey).toBeNull();
    expect(
      useCurrentAccountSelected.getState().accountGroupMemberIds
    ).toBeNull();
  });

  // INV-03 — opening a group stores its key and member ids.
  it('stores the group key and member ids when opening a group', () => {
    useCurrentAccountSelected.getState().setAccountGroupKey('group:abc123');
    useCurrentAccountSelected
      .getState()
      .setAccountGroupMemberIds(['88', '89']);

    expect(useCurrentAccountSelected.getState().accountGroupKey).toBe(
      'group:abc123'
    );
    expect(
      useCurrentAccountSelected.getState().accountGroupMemberIds
    ).toEqual(['88', '89']);
  });

  // INV-03 — clearing restores single mode without touching the account id.
  it('clears the group payload without touching the selected account', () => {
    useCurrentAccountSelected.setState(() => ({ accountId: '88' }));
    useCurrentAccountSelected.getState().setAccountGroupKey('group:abc123');
    useCurrentAccountSelected.getState().clearAccountGroup();

    expect(useCurrentAccountSelected.getState().accountGroupKey).toBeNull();
    expect(
      useCurrentAccountSelected.getState().accountGroupMemberIds
    ).toBeNull();
    expect(useCurrentAccountSelected.getState().accountId).toBe('88');
  });
});
