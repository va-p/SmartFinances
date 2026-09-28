import { renderHook, act } from '@testing-library/react-native';

import { useDateNavigation } from '../useDateNavigation';

import { PeriodProps } from '../../interfaces/chartPeriod';

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

  // WEEK-04 — arrows move exactly ±7 days in weeks mode
  it('moves exactly one week on next/prev in weeks mode', () => {
    const setSelectedDate = jest.fn();
    const { result } = renderHook(() =>
      useDateNavigation({
        selectedPeriod: makePeriod('weeks'),
        selectedDate, // Saturday 2026-08-15
        setSelectedDate,
      })
    );

    act(() => {
      result.current.handleDateChange('next');
    });
    expect(setSelectedDate).toHaveBeenLastCalledWith(new Date(2026, 7, 22));

    act(() => {
      result.current.handleDateChange('prev');
    });
    expect(setSelectedDate).toHaveBeenLastCalledWith(new Date(2026, 7, 8));
  });

  // WEEK-06 — tapping a week label jumps to the last day (Sunday) of that ISO week
  it('jumps to the Sunday of the tapped ISO week', () => {
    const setSelectedDate = jest.fn();
    const { result } = renderHook(() =>
      useDateNavigation({
        selectedPeriod: makePeriod('weeks'),
        selectedDate,
        setSelectedDate,
      })
    );

    act(() => {
      result.current.handlePressDate('Sem 10 \n 2026');
    });
    // ISO week 10 of 2026 = Mon Mar 2 - Sun Mar 8
    expect(setSelectedDate).toHaveBeenLastCalledWith(new Date(2026, 2, 8));
  });

  // Edge case — ISO week-year differs from calendar year (ISO week 1 of 2026 starts 2025-12-29)
  it('jumps to the Sunday of an ISO week whose week-year differs from the calendar year', () => {
    const setSelectedDate = jest.fn();
    const { result } = renderHook(() =>
      useDateNavigation({
        selectedPeriod: makePeriod('weeks'),
        selectedDate,
        setSelectedDate,
      })
    );

    act(() => {
      result.current.handlePressDate('Sem 1 \n 2026');
    });
    // ISO week 1 of 2026 = Mon 2025-12-29 - Sun 2026-01-04
    expect(setSelectedDate).toHaveBeenLastCalledWith(new Date(2026, 0, 4));
  });
});
