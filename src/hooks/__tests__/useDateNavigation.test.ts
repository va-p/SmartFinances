import { renderHook, act } from '@testing-library/react-native';

import { useDateNavigation } from '../useDateNavigation';

import { PeriodProps } from '../../screens/ChartPeriodSelect';

const makePeriod = (
  period: PeriodProps['period']
): PeriodProps => ({
  id: '1',
  name: 'Meses',
  period,
});

describe('useDateNavigation', () => {
  const selectedDate = new Date(2026, 7, 15); // August 2026 (local)

  it('moves one month on next/prev in months mode', () => {
    const setSelectedDate = jest.fn();
    const { result } = renderHook(() =>
      useDateNavigation({
        selectedPeriod: makePeriod('months'),
        selectedDate,
        setSelectedDate,
      })
    );

    act(() => {
      result.current.handleDateChange('next');
    });
    expect(setSelectedDate).toHaveBeenLastCalledWith(new Date(2026, 8, 15));

    act(() => {
      result.current.handleDateChange('prev');
    });
    expect(setSelectedDate).toHaveBeenLastCalledWith(new Date(2026, 6, 15));
  });

  it('moves one year on next/prev in years mode', () => {
    const setSelectedDate = jest.fn();
    const { result } = renderHook(() =>
      useDateNavigation({
        selectedPeriod: makePeriod('years'),
        selectedDate,
        setSelectedDate,
      })
    );

    act(() => {
      result.current.handleDateChange('next');
    });
    expect(setSelectedDate).toHaveBeenLastCalledWith(new Date(2027, 7, 15));

    act(() => {
      result.current.handleDateChange('prev');
    });
    expect(setSelectedDate).toHaveBeenLastCalledWith(new Date(2025, 7, 15));
  });

  // AC-001.3 — 'all' navigates like months (regression fix)
  it('moves one month on next/prev in "all" mode', () => {
    const setSelectedDate = jest.fn();
    const { result } = renderHook(() =>
      useDateNavigation({
        selectedPeriod: makePeriod('all'),
        selectedDate,
        setSelectedDate,
      })
    );

    act(() => {
      result.current.handleDateChange('next');
    });
    expect(setSelectedDate).toHaveBeenLastCalledWith(new Date(2026, 8, 15));
  });

  // AC-001.4 — tapping a month label jumps to its last day
  it('jumps to the last day of the tapped month for months labels', () => {
    const setSelectedDate = jest.fn();
    const { result } = renderHook(() =>
      useDateNavigation({
        selectedPeriod: makePeriod('months'),
        selectedDate,
        setSelectedDate,
      })
    );

    act(() => {
      result.current.handlePressDate('Ago \n 2026');
    });
    expect(setSelectedDate).toHaveBeenLastCalledWith(new Date(2026, 7, 31));
  });

  // AC-001.4 — 'all' parses month labels like months (regression fix)
  it('jumps to the tapped month for month labels in "all" mode', () => {
    const setSelectedDate = jest.fn();
    const { result } = renderHook(() =>
      useDateNavigation({
        selectedPeriod: makePeriod('all'),
        selectedDate,
        setSelectedDate,
      })
    );

    act(() => {
      result.current.handlePressDate('Ago \n 2026');
    });
    expect(setSelectedDate).toHaveBeenLastCalledWith(new Date(2026, 7, 31));
  });

  it('jumps to the last day of the tapped year for year labels', () => {
    const setSelectedDate = jest.fn();
    const { result } = renderHook(() =>
      useDateNavigation({
        selectedPeriod: makePeriod('years'),
        selectedDate,
        setSelectedDate,
      })
    );

    act(() => {
      result.current.handlePressDate('2025');
    });
    expect(setSelectedDate).toHaveBeenLastCalledWith(new Date(2025, 11, 31));
  });
});
