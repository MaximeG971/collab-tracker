-- Include the brand name in the collaborations_with_status view so list cards can display it.
-- security_invoker remains required so RLS on collaborations and brands still applies.

create or replace view public.collaborations_with_status as
select
  c.*,
  b.name as brand_name,
  coalesce(
    (
      select d.status
      from public.deliverables d
      where d.collaboration_id = c.id
      order by
        case d.status
          when 'to_contact' then 0
          when 'validated' then 1
          when 'product_received' then 2
          when 'to_create' then 3
          when 'to_validate' then 4
          when 'scheduled' then 5
          when 'published' then 6
        end
      limit 1
    ),
    'to_contact'
  ) as computed_status,
  exists (
    select 1
    from public.deliverables d
    where d.collaboration_id = c.id
      and d.deadline_date < current_date
      and d.status <> 'published'
  ) as is_late
from public.collaborations c
left join public.brands b
  on b.id = c.brand_id;

alter view public.collaborations_with_status set (security_invoker = true);

grant select on public.collaborations_with_status to authenticated;
