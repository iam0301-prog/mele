import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DateOnlyField, LocationFields } from '@/components/BirthInputs';

describe('<DateOnlyField />', () => {
  it('renders year/month/day selects', () => {
    render(<DateOnlyField date="" onDateChange={() => {}} />);
    expect(screen.getByText('西元年')).toBeInTheDocument();
    expect(screen.getByText('月份')).toBeInTheDocument();
    expect(screen.getByText('日期')).toBeInTheDocument();
  });

  it('shows placeholder when no date selected', () => {
    render(<DateOnlyField date="" onDateChange={() => {}} />);
    expect(screen.getAllByText(/尚未選擇日期/).length).toBeGreaterThan(0);
  });

  it('shows formatted date when value provided', () => {
    render(<DateOnlyField date="1990-06-15" onDateChange={() => {}} />);
    expect(screen.getAllByText(/1990 年 06 月 15 日/).length).toBeGreaterThan(0);
  });

  it('calls onDateChange when year is selected', () => {
    const onChange = vi.fn();
    render(<DateOnlyField date="1990-06-15" onDateChange={onChange} />);
    const yearSelect = screen.getByRole('combobox', { name: /年/i }) as HTMLSelectElement;
    fireEvent.change(yearSelect, { target: { value: '1995' } });
    expect(onChange).toHaveBeenCalledWith('1995-06-15');
  });

  it('renders custom hint when provided', () => {
    render(<DateOnlyField date="" onDateChange={() => {}} hint="自訂提示文字" />);
    expect(screen.getByText('自訂提示文字')).toBeInTheDocument();
  });
  it('updates timezone when a birthplace preset is selected', () => {
    const onLatitudeChange = vi.fn();
    const onLongitudeChange = vi.fn();
    const onTimezoneChange = vi.fn();

    render(
      <LocationFields
        locale="en"
        latitude={25.033}
        longitude={121.5654}
        timezoneDate="1990-07-01"
        timezoneTime="12:00"
        onLatitudeChange={onLatitudeChange}
        onLongitudeChange={onLongitudeChange}
        onTimezoneChange={onTimezoneChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Los Angeles' }));

    expect(onLatitudeChange).toHaveBeenCalledWith(34.0522);
    expect(onLongitudeChange).toHaveBeenCalledWith(-118.2437);
    expect(onTimezoneChange).toHaveBeenCalledWith(-7);
  });
});
