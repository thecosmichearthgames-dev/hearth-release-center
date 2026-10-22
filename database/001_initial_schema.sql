-- Initial release intelligence schema. Apply to a managed PostgreSQL database.
create extension if not exists pgcrypto;
create table if not exists sources (
 id uuid primary key default gen_random_uuid(),
 publisher text not null, category text not null,
 homepage_url text not null, feed_url text,
 active boolean not null default true,
 last_checked_at timestamptz, last_success_at timestamptz,
 last_error text, created_at timestamptz not null default now()
);
create table if not exists products (
 id uuid primary key default gen_random_uuid(),
 publisher text not null, game text not null,
 category text not null, name text not null,
 sku text, upc text, product_type text,
 created_at timestamptz not null default now(),
 unique(publisher,sku)
);
create table if not exists proposals (
 id uuid primary key default gen_random_uuid(),
 product_id uuid references products(id),
 proposed_product jsonb not null default '{}'::jsonb,
 proposed_milestones jsonb not null default '[]'::jsonb,
 source_id uuid references sources(id),
 evidence_url text not null,
 evidence_excerpt text,
 change_reason text,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 discovered_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid,
 reviewer_note text
);
create table if not exists milestones (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references products(id) on delete cascade,
 kind text not null check(kind in ('announcement','distributor_deadline','preorder_open','preorder_close','prerelease','early_sale','street_date','event_deadline','restock','other')),
 starts_on date, ends_on date,
 date_precision text not null default 'day' check(date_precision in ('day','month','quarter','unknown')),
 notes text,
 evidence_url text not null,
 approved_proposal_id uuid references proposals(id),
 updated_at timestamptz not null default now()
);
create table if not exists review_audit (
 id uuid primary key default gen_random_uuid(),
 proposal_id uuid not null references proposals(id),
 reviewer_id uuid not null,
 decision text not null check(decision in ('approved','rejected')),
 before_snapshot jsonb,
 after_snapshot jsonb,
 created_at timestamptz not null default now()
);
create index if not exists idx_proposals_status on proposals(status,discovered_at desc);
create index if not exists idx_milestones_date on milestones(starts_on,kind);
-- Security: deny direct access until authenticated server-side roles and RLS policies are installed.
revoke all on sources,products,proposals,milestones,review_audit from public;
