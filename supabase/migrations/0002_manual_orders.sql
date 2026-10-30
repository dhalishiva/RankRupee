-- Owner-added listings are recorded as provider 'manual' (no external charge).
alter table public.orders drop constraint orders_provider_check;
alter table public.orders add constraint orders_provider_check check (provider in ('razorpay', 'paypal', 'manual'));
