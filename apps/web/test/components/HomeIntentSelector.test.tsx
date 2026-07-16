import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import HomeIntentSelector from '@/components/HomeIntentSelector';

describe('HomeIntentSelector', () => {
  it('recommends one clear tool after a need is selected', async () => {
    const user = userEvent.setup();
    render(<HomeIntentSelector locale="zh-TW" />);

    await user.click(screen.getByRole('button', { name: '性格與天賦' }));

    expect(screen.getByRole('heading', { name: '生命靈數' })).toBeInTheDocument();
    expect(screen.getByText('只需生日 · 約 60 秒')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '從這裡開始' })).toHaveAttribute('href', '/zh-TW/tools/numerology');
  });
});
