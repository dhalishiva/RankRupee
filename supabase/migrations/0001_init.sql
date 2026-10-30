-- Softing: pay-to-rank leaderboard. Ranks are in USD cents.

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  url text not null,
  url_key text not null unique,
  domain text not null,
  name text not null check (char_length(name) between 2 and 60),
  tagline text not null check (char_length(tagline) between 4 and 90),
  description text not null default '' check (char_length(description) <= 240),
  category text not null,
  maker_handle text check (maker_handle is null or maker_handle ~ '^[A-Za-z0-9_]{1,15}$'),
  total_cents bigint not null default 0 check (total_cents >= 0),
  clicks bigint not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  last_paid_at timestamptz not null default now()
);

create index listings_rank_idx on public.listings (total_cents desc, last_paid_at asc) where not hidden;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('new', 'topup')),
  listing_id uuid references public.listings(id),
  draft jsonb,
  email text not null check (char_length(email) <= 254),
  amount_cents bigint not null check (amount_cents >= 100 and amount_cents <= 100000000),
  provider text not null check (provider in ('razorpay', 'paypal')),
  provider_order_id text unique,
  charge_amount bigint not null,          -- minor units of charge_currency
  charge_currency text not null check (charge_currency in ('INR', 'USD')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  provider_payment_id text unique,
  result_listing_id uuid references public.listings(id),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  check ((kind = 'new' and draft is not null) or (kind = 'topup' and listing_id is not null))
);

create index orders_paid_idx on public.orders (paid_at desc) where status = 'paid';

alter table public.listings enable row level security;
alter table public.orders enable row level security;

-- Anyone can read visible listings. No client writes anywhere; orders are service-role only.
create policy "public can read visible listings" on public.listings
  for select to anon, authenticated using (not hidden);

-- Leaderboard with overall rank. Ties go to whoever reached their total first.
create or replace function public.ranked_listings()
returns table (
  rank bigint, slug text, url text, domain text, name text, tagline text, description text,
  category text, maker_handle text, total_cents bigint, clicks bigint, created_at timestamptz, last_paid_at timestamptz
)
language sql stable security invoker set search_path = ''
as $$
  select row_number() over (order by l.total_cents desc, l.last_paid_at asc) as rank,
         l.slug, l.url, l.domain, l.name, l.tagline, l.description, l.category, l.maker_handle,
         l.total_cents, l.clicks, l.created_at, l.last_paid_at
  from public.listings l
  where not l.hidden;
$$;

-- Today's board (UTC day): ranked by what each listing paid today.
create or replace function public.today_ranking()
returns table (rank bigint, slug text, name text, domain text, tagline text, category text, today_cents bigint)
language sql stable security definer set search_path = ''
as $$
  select row_number() over (order by sum(o.amount_cents) desc, min(o.paid_at) asc) as rank,
         l.slug, l.name, l.domain, l.tagline, l.category, sum(o.amount_cents)::bigint as today_cents
  from public.orders o
  join public.listings l on l.id = o.result_listing_id
  where o.status = 'paid' and not l.hidden
    and o.paid_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc'
  group by l.id;
$$;

-- Public activity feed: only non-sensitive columns.
create or replace function public.recent_activity(p_limit int default 20)
returns table (slug text, name text, amount_cents bigint, kind text, paid_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select l.slug, l.name, o.amount_cents, o.kind, o.paid_at
  from public.orders o
  join public.listings l on l.id = o.result_listing_id
  where o.status = 'paid' and not l.hidden
  order by o.paid_at desc
  limit least(greatest(p_limit, 1), 100);
$$;

create or replace function public.listing_payments(p_slug text)
returns table (amount_cents bigint, kind text, paid_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select o.amount_cents, o.kind, o.paid_at
  from public.orders o
  join public.listings l on l.id = o.result_listing_id
  where o.status = 'paid' and not l.hidden and l.slug = p_slug
  order by o.paid_at desc
  limit 50;
$$;

create or replace function public.site_stats()
returns table (listings bigint, total_cents bigint, payments bigint)
language sql stable security definer set search_path = ''
as $$
  select (select count(*) from public.listings where not hidden),
         coalesce((select sum(amount_cents) from public.orders where status = 'paid'), 0)::bigint,
         (select count(*) from public.orders where status = 'paid');
$$;

create or replace function public.record_click(p_slug text)
returns void
language sql volatile security definer set search_path = ''
as $$
  update public.listings set clicks = clicks + 1 where slug = p_slug and not hidden;
$$;

-- Marks an order paid exactly once and applies it. Returns the listing slug.
create or replace function public.fulfill_order(p_order_id uuid, p_payment_id text)
returns text
language plpgsql volatile security definer set search_path = ''
as $$
declare
  o public.orders;
  lid uuid;
  base text;
  candidate text;
  n int := 1;
  d jsonb;
begin
  update public.orders
     set status = 'paid', provider_payment_id = p_payment_id, paid_at = now()
   where id = p_order_id and status = 'pending'
  returning * into o;

  if not found then
    -- already fulfilled (verify + webhook race) or unknown order
    select l.slug into candidate
      from public.orders x join public.listings l on l.id = x.result_listing_id
     where x.id = p_order_id and x.status = 'paid';
    return candidate;
  end if;

  if o.kind = 'topup' then
    lid := o.listing_id;
    update public.listings set total_cents = total_cents + o.amount_cents, last_paid_at = now() where id = lid;
  else
    d := o.draft;
    select id into lid from public.listings where url_key = d->>'url_key';
    if lid is not null then
      -- someone listed the same URL meanwhile: count the payment toward that listing
      update public.listings set total_cents = total_cents + o.amount_cents, last_paid_at = now() where id = lid;
    else
      base := d->>'slug';
      candidate := base;
      while exists (select 1 from public.listings where slug = candidate) loop
        n := n + 1;
        candidate := base || '-' || n;
      end loop;
      insert into public.listings (slug, url, url_key, domain, name, tagline, description, category, maker_handle, total_cents)
      values (candidate, d->>'url', d->>'url_key', d->>'domain', d->>'name', d->>'tagline',
              coalesce(d->>'description', ''), d->>'category', nullif(d->>'maker_handle', ''), o.amount_cents)
      returning id into lid;
    end if;
  end if;

  update public.orders set result_listing_id = lid where id = o.id;
  select slug into candidate from public.listings where id = lid;
  return candidate;
end;
$$;

-- Lock down: public reads go through the functions above; fulfill_order is server-only.
revoke all on function public.fulfill_order(uuid, text) from public, anon, authenticated;
grant execute on function public.fulfill_order(uuid, text) to service_role;

revoke all on function public.today_ranking() from public;
revoke all on function public.recent_activity(int) from public;
revoke all on function public.listing_payments(text) from public;
revoke all on function public.site_stats() from public;
revoke all on function public.record_click(text) from public;
grant execute on function public.ranked_listings(), public.today_ranking(), public.recent_activity(int),
  public.listing_payments(text), public.site_stats(), public.record_click(text) to anon, authenticated;

revoke all on public.orders from anon, authenticated;
revoke insert, update, delete on public.listings from anon, authenticated;
