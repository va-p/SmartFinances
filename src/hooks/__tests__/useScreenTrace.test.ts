import { AppState, AppStateStatus } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';

import { trace } from '@react-native-firebase/perf';

import { useScreenTrace } from '../useScreenTrace';

// Focus emulation: run the effect on mount (screen visible) and its cleanup on
// unmount (screen not visible). Blur/refocus transitions in tab screens resolve
// to the same effect/cleanup pair in the real navigator.
jest.mock('expo-router', () => {
  const React = jest.requireActual('react');

  return {
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(() => callback(), [callback]);
    },
  };
});

type MockTrace = {
  start: jest.Mock;
  stop: jest.Mock;
  putAttribute: jest.Mock;
};

let mockTraces: MockTrace[];

jest.mock('@react-native-firebase/perf', () => ({
  getPerformance: jest.fn(() => ({})),
  trace: jest.fn(() => {
    const mockTrace: MockTrace = {
      start: jest.fn(),
      stop: jest.fn(),
      putAttribute: jest.fn(),
    };
    mockTraces.push(mockTrace);
    return mockTrace;
  }),
}));

describe('useScreenTrace', () => {
  let appStateChangeHandler: ((nextState: AppStateStatus) => void) | null;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTraces = [];
    appStateChangeHandler = null;
    AppState.currentState = 'active';

    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation(((_event: string, handler: (nextState: AppStateStatus) => void) => {
        appStateChangeHandler = handler;
        return { remove: jest.fn() };
      }) as typeof AppState.addEventListener);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe.each([['home_screen'], ['accounts_screen'], ['register_transaction_screen']])(
    'trace lifecycle for %s',
    (screenName: string) => {
      // AC 1/3/5 + AC 10 — a custom trace named after the screen starts on visible
      it('starts a custom trace named after the screen when it becomes visible', () => {
        renderHook(() => useScreenTrace(screenName));

        expect(trace).toHaveBeenCalledWith(expect.anything(), screenName);
        expect(mockTraces).toHaveLength(1);
        expect(mockTraces[0].start).toHaveBeenCalledTimes(1);
      });

      // AC 2/4/6 — the trace stops when the screen stops being visible
      it('stops the trace when the screen stops being visible', () => {
        const { unmount } = renderHook(() => useScreenTrace(screenName));

        unmount();

        expect(mockTraces[0].stop).toHaveBeenCalledTimes(1);
      });
    }
  );

  // AC 9 — every trace carries the platform attribute (ios | android)
  it('attaches the platform attribute to the trace', () => {
    renderHook(() => useScreenTrace('home_screen'));

    expect(mockTraces[0].putAttribute).toHaveBeenCalledWith(
      'platform',
      expect.stringMatching(/^(ios|android)$/)
    );
  });

  // AC 7 — backgrounding the app stops the running trace
  it('stops the running trace when the app leaves the active state', () => {
    renderHook(() => useScreenTrace('home_screen'));

    act(() => {
      appStateChangeHandler?.('background');
    });

    expect(mockTraces[0].stop).toHaveBeenCalledTimes(1);
  });

  // AC 8 — returning to active while still visible starts a new sample
  it('starts a new trace sample when the app returns to active while visible', () => {
    renderHook(() => useScreenTrace('home_screen'));

    act(() => {
      appStateChangeHandler?.('background');
    });
    act(() => {
      appStateChangeHandler?.('active');
    });

    expect(mockTraces).toHaveLength(2);
    expect(mockTraces[0].stop).toHaveBeenCalledTimes(1);
    expect(mockTraces[1].start).toHaveBeenCalledTimes(1);
  });

  // Edge case — no sample is created while the app is not active
  it('does not create a trace while the app is not active', () => {
    AppState.currentState = 'background';

    renderHook(() => useScreenTrace('home_screen'));

    expect(mockTraces).toHaveLength(0);
  });

  // Edge case — background followed by blur stops the session exactly once
  it('stops a visibility session at most once', () => {
    const { unmount } = renderHook(() => useScreenTrace('home_screen'));

    act(() => {
      appStateChangeHandler?.('background');
    });
    unmount();

    expect(mockTraces[0].stop).toHaveBeenCalledTimes(1);
  });
});
