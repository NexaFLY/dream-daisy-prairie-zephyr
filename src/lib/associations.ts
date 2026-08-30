import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { SITE } from "@/lib/constants";
import { getSql, type Sql } from "@/lib/db";

export const CATEGORIES = [
  "solidarity",
  "education",
  "health",
  "environment",
  "culture",
  "animal",
  "local",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type GiftToken = "SOL" | "USDC" | "FLY" | "nUSD";
export type GiftSource = "donor" | "nexa";

export type Association = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  country: string;
  website: string;
  rna: string;
  category: Category;
  walletAddress: string | null;
  logoUrl: string;
  hosted: boolean;
  featured: boolean;
  published: boolean;
  createdAt: string;
  giftCount: number;
};

export type Gift = {
  id: number;
  token: GiftToken;
  amount: string;
  donorWallet: string;
  donorName: string;
  message: string;
  txSignature: string;
  source: GiftSource;
  createdAt: string;
};

export type AssociationDetail = Association & { gifts: Gift[] };

export type SpaceInput = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  city: string;
  website: string;
  rna: string;
  category: Category;
  published: boolean;
};

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const AMOUNT_RE = /^\d+(?:\.\d{1,9})?$/;
const TOKENS: GiftToken[] = ["SOL", "USDC", "FLY", "nUSD"];
const RESERVED = new Set([
  "nexa-fly",
  "nexa",
  "admin",
  "login",
  "espace",
  "associations",
  "api",
  "nusd",
  "whitepaper",
]);

type AssocRow = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  country: string;
  website: string;
  rna: string;
  category: string;
  wallet_address: string | null;
  logo_url: string | null;
  hosted: boolean;
  featured: boolean;
  published: boolean;
  created_at: string;
  gift_count: number;
};

type GiftRow = {
  id: number;
  token: string;
  amount: string;
  donor_wallet: string;
  donor_name: string;
  message: string;
  tx_signature: string;
  source: string;
  created_at: string;
};

function asCategory(value: string): Category {
  return (CATEGORIES as readonly string[]).includes(value) ? (value as Category) : "other";
}

function asToken(value: string): GiftToken {
  return TOKENS.includes(value as GiftToken) ? (value as GiftToken) : "SOL";
}

function asSource(value: string): GiftSource {
  return value === "nexa" ? "nexa" : "donor";
}

const PHOTO_SLUGS = new Set([
  "croix-rouge-francaise",
  "cicr",
  "wwf-france",
  "wwf",
  "amnesty-france",
  "amnesty",
  "oxfam",
  "unicef-france",
  "unicef",
  "msf-france",
  "msf",
  "spa",
  "save-the-children",
  "pam",
  "humanite-inclusion",
  "secours-populaire",
  "emmaus-france",
]);

function mapAssoc(row: AssocRow): Association {
  const slug = row.slug;
  return {
    id: row.id,
    slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    city: row.city,
    country: row.country,
    website: row.website,
    rna: row.rna,
    category: asCategory(row.category),
    walletAddress: row.wallet_address,
    logoUrl: PHOTO_SLUGS.has(slug) ? `/orgs/${slug}.png` : (row.logo_url ?? ""),
    hosted: Boolean(row.hosted),
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    createdAt: String(row.created_at),
    giftCount: Number(row.gift_count) || 0,
  };
}

function mapGift(row: GiftRow): Gift {
  return {
    id: row.id,
    token: asToken(row.token),
    amount: row.amount,
    donorWallet: row.donor_wallet,
    donorName: row.donor_name,
    message: row.message,
    txSignature: row.tx_signature,
    source: asSource(row.source),
    createdAt: String(row.created_at),
  };
}

const ASSOC_SELECT = `
  a.id, a.slug, a.name, a.tagline, a.description, a.city, a.country,
  a.website, a.rna, a.category, a.wallet_address, a.logo_url, a.hosted, a.featured, a.published,
  a.created_at::text as created_at,
  coalesce((select count(*)::int from gifts g where g.association_id = a.id), 0) as gift_count
`;

async function loadByUser(sql: Sql, userId: string): Promise<Association | null> {
  const rows = await sql.query<AssocRow>(
    `select ${ASSOC_SELECT} from associations a where a.user_id = $1 limit 1`,
    [userId],
  );
  return rows[0] ? mapAssoc(rows[0]) : null;
}

export function slugify(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "asso";
}

function clip(value: unknown, max: number): string {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

function parseSpace(input: unknown): SpaceInput {
  const raw = (input ?? {}) as Record<string, unknown>;
  const name = clip(raw.name, 80);
  if (name.length < 2) throw new Error("name");
  let slug = clip(raw.slug, 48).toLowerCase();
  if (!slug) slug = slugify(name);
  if (!SLUG_RE.test(slug) || slug.length < 3) throw new Error("slug");
  if (RESERVED.has(slug)) throw new Error("slug");
  const category = asCategory(clip(raw.category, 32));
  return {
    name,
    slug,
    tagline: clip(raw.tagline, 140),
    description: clip(raw.description, 2000),
    city: clip(raw.city, 80),
    website: clip(raw.website, 200),
    rna: clip(raw.rna, 32),
    category,
    published: raw.published !== false,
  };
}

export const listAssociations = createServerFn({ method: "GET" }).handler(
  async (): Promise<Association[]> => {
    const sql = await getSql();
    const rows = await sql.query<AssocRow>(
      `select ${ASSOC_SELECT} from associations a
       where a.published = true
       order by a.featured desc, (a.country = 'France') desc, a.name asc`,
    );
    return rows.map(mapAssoc);
  },
);

export const getAssociation = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const slug =
      typeof input === "object" && input && "slug" in input
        ? clip((input as { slug: unknown }).slug, 48).toLowerCase()
        : "";
    return { slug };
  })
  .handler(async ({ data }): Promise<AssociationDetail | null> => {
    if (!SLUG_RE.test(data.slug)) return null;
    const sql = await getSql();
    const rows = await sql.query<AssocRow>(
      `select ${ASSOC_SELECT} from associations a
       where a.slug = $1 and a.published = true
       limit 1`,
      [data.slug],
    );
    const row = rows[0];
    if (!row) return null;
    const gifts = await sql.query<GiftRow>(
      `select id, token, amount, donor_wallet, donor_name, message, tx_signature, source,
              created_at::text as created_at
       from gifts
       where association_id = $1
       order by created_at desc
       limit 40`,
      [row.id],
    );
    return { ...mapAssoc(row), gifts: gifts.map(mapGift) };
  });

export const recordGift = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    const slug = clip(raw.slug, 48).toLowerCase();
    if (!SLUG_RE.test(slug)) throw new Error("slug");
    const token = asToken(clip(raw.token, 8));
    const amount = clip(raw.amount, 20);
    if (!AMOUNT_RE.test(amount) || Number(amount) <= 0) throw new Error("amount");
    const donorWallet = clip(raw.donorWallet, 44);
    if (donorWallet && !BASE58.test(donorWallet)) throw new Error("wallet");
    const txSignature = clip(raw.txSignature, 128);
    if (txSignature && !/^[1-9A-HJ-NP-Za-km-z]{32,128}$/.test(txSignature)) {
      throw new Error("tx");
    }
    return {
      slug,
      token,
      amount,
      donorWallet,
      donorName: clip(raw.donorName, 80),
      message: clip(raw.message, 280),
      txSignature,
    };
  })
  .handler(async ({ data }): Promise<Gift> => {
    const sql = await getSql();
    const rows = await sql.query<{ id: number; wallet_address: string | null }>(
      `select id, wallet_address from associations where slug = $1 and published = true limit 1`,
      [data.slug],
    );
    const assoc = rows[0];
    if (!assoc) throw new Error("missing");
    if (!assoc.wallet_address) throw new Error("nowallet");
    const source: GiftSource = data.donorWallet === SITE.wallet ? "nexa" : "donor";
    const inserted = await sql.query<GiftRow>(
      `insert into gifts (
         association_id, token, amount, donor_wallet, donor_name, message, tx_signature, source
       ) values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id, token, amount, donor_wallet, donor_name, message, tx_signature, source,
                 created_at::text as created_at`,
      [
        assoc.id,
        data.token,
        data.amount,
        data.donorWallet,
        data.donorName,
        data.message,
        data.txSignature,
        source,
      ],
    );
    return mapGift(inserted[0]);
  });

export const getMySpace = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Association | null> => {
    const sql = await getSql();
    return loadByUser(sql, context.userId);
  });

export const saveMySpace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => parseSpace(input))
  .handler(async ({ context, data }): Promise<Association> => {
    const sql = await getSql();
    const taken = await sql.query<{ id: number }>(
      `select id from associations where slug = $1 and user_id <> $2 limit 1`,
      [data.slug, context.userId],
    );
    if (taken[0]) throw new Error("slug-taken");

    const existing = await sql.query<{ id: number }>(
      `select id from associations where user_id = $1 limit 1`,
      [context.userId],
    );

    if (existing[0]) {
      await sql.query(
        `update associations set
           slug = $2, name = $3, tagline = $4, description = $5, city = $6,
           website = $7, rna = $8, category = $9, published = $10, updated_at = now()
         where user_id = $1`,
        [
          context.userId,
          data.slug,
          data.name,
          data.tagline,
          data.description,
          data.city,
          data.website,
          data.rna,
          data.category,
          data.published,
        ],
      );
    } else {
      await sql.query(
        `insert into associations (
           user_id, slug, name, tagline, description, city, website, rna, category, published
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          context.userId,
          data.slug,
          data.name,
          data.tagline,
          data.description,
          data.city,
          data.website,
          data.rna,
          data.category,
          data.published,
        ],
      );
    }

    const saved = await loadByUser(sql, context.userId);
    if (!saved) throw new Error("missing");
    return saved;
  });

export const saveMyWallet = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const address =
      typeof input === "object" && input && "address" in input
        ? clip((input as { address: unknown }).address, 44)
        : "";
    if (!BASE58.test(address)) throw new Error("wallet");
    return { address };
  })
  .handler(async ({ context, data }): Promise<Association> => {
    const sql = await getSql();
    const mine = await sql.query<{ id: number }>(
      `select id from associations where user_id = $1 limit 1`,
      [context.userId],
    );
    if (!mine[0]) throw new Error("missing");
    if (data.address !== SITE.wallet) {
      const clash = await sql.query<{ id: number }>(
        `select id from associations where wallet_address = $1 and user_id <> $2 limit 1`,
        [data.address, context.userId],
      );
      if (clash[0]) throw new Error("wallet-taken");
    }
    await sql.query(
      `update associations set wallet_address = $2, hosted = $3, updated_at = now() where user_id = $1`,
      [context.userId, data.address, data.address === SITE.wallet],
    );
    const saved = await loadByUser(sql, context.userId);
    if (!saved) throw new Error("missing");
    return saved;
  });

export const listMyGifts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Gift[]> => {
    const sql = await getSql();
    const rows = await sql.query<GiftRow>(
      `select g.id, g.token, g.amount, g.donor_wallet, g.donor_name, g.message,
              g.tx_signature, g.source, g.created_at::text as created_at
       from gifts g
       join associations a on a.id = g.association_id
       where a.user_id = $1
       order by g.created_at desc
       limit 80`,
      [context.userId],
    );
    return rows.map(mapGift);
  });
