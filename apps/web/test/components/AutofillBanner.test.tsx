import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AutofillBanner } from '@/components/AutofillBanner';

describe('<AutofillBanner />', () => {
  it('renders nothing when show=false', () => {
    const { container } = render(<AutofillBanner show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('lists supplied fields', () => {
    render(<AutofillBanner show={true} fields={['出生日期', '出生時間']} />);
    expect(screen.getByText(/出生日期 \/ 出生時間/)).toBeInTheDocument();
  });

  it('falls back to default text when no fields given', () => {
    render(<AutofillBanner show={true} />);
    expect(screen.getByText(/常用出生資料/)).toBeInTheDocument();
  });

  it('links to profile page', () => {
    render(<AutofillBanner show={true} />);
    const link = screen.getByRole('link', { name: /編輯資料/ });
    expect(link).toHaveAttribute('href', '/account/profile');
  });
});
