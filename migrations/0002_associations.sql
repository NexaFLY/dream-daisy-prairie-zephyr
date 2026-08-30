-- Association spaces: one profile per signed-in user, public gifts ledger.

create table if not exists associations (
  id serial primary key,
  user_id text not null unique,
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  city text not null default '',
  country text not null default 'France',
  website text not null default '',
  rna text not null default '',
  category text not null default 'solidarity',
  wallet_address text unique,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists associations_published_idx on associations (published);
create index if not exists associations_featured_idx on associations (featured);

create table if not exists gifts (
  id serial primary key,
  association_id integer not null references associations(id) on delete cascade,
  token text not null,
  amount text not null,
  donor_wallet text not null default '',
  donor_name text not null default '',
  message text not null default '',
  tx_signature text not null default '',
  source text not null default 'donor',
  created_at timestamptz not null default now()
);

create index if not exists gifts_association_id_idx on gifts (association_id);
create index if not exists gifts_created_at_idx on gifts (created_at desc);

insert into associations (
  user_id, slug, name, tagline, description, city, country, website, rna,
  category, wallet_address, featured, published
)
values (
  'nexa-system',
  'nexa-fly',
  'Nexa FLY',
  'Le rail de transparence des dons.',
  'Association loi 1901 basée à Salon-de-Provence. Nexa FLY construit l’infrastructure pour que les dons caritatifs soient traçables, publics, et accessibles partout — sans intermédiaire opaque. Les dons reçus ici alimentent le wallet de transparence, puis peuvent être redistribués vers les associations partenaires.',
  'Salon-de-Provence',
  'France',
  'https://nexafly.org',
  'W131019858',
  'solidarity',
  'bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',
  true,
  true
)
on conflict (slug) do nothing;
