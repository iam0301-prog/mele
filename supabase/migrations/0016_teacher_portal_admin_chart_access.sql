-- Let admins use teacher portal impersonation without losing booked members' chart context.
-- Teachers remain limited to their own booked customers; admins can read all chart_records.

create policy "chart_records_admin_select" on public.chart_records
  for select using (public.is_admin(auth.uid()));
