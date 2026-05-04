import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DateOnlyField } from '@/components/BirthInputs';

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
});
