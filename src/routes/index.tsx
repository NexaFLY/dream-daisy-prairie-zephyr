import { createFileRoute } from "@tanstack/react-router";
import { AppFrame, useDonate } from "@/components/app-frame";
import { SwapSection } from "@/components/swap-widget";
import {
  Contact,
  Faq,
  Hero,
  HowItWorks,
  Market,
  Mission,
  Network,
  NusdMarket,
  Problem,
  Projects,
  Team,
  Token,
  Transparency,
} from "@/components/sections";
import { PoolLab } from "@/components/pool-lab";
import { listHomeAssociations } from "@/lib/associations";
import { getMarket, getNusdMarket } from "@/lib/market";
import { listFlyPools } from "@/lib/pools";
import { fetchFlyQuote, type FlyQuote } from "@/lib/swap-quote";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [quote, nusdQuote, flyPools, orgs, flyQuote] = await Promise.all([
      getMarket().catch(() => null),
      getNusdMarket().catch(() => null),
      listFlyPools().catch(() => [] as Awaited<ReturnType<typeof listFlyPools>>),
      listHomeAssociations().catch(() => [] as Awaited<ReturnType<typeof listHomeAssociations>>),
      fetchFlyQuote("10", "USDC").catch(() => null as FlyQuote | null),
    ]);
    return { quote, nusdQuote, orgs, flyQuote, flyPools };
  },
  component: Home,
  head: () => ({
    links: [
      { rel: "canonical", href: "https://nexafly.org/" },
      { rel: "preload", href: "/hero.jpg", as: "image" },
      { rel: "preload", href: "/logo-mark.png", as: "image" },
    ],
  }),
});

function Home() {
  const data = Route.useLoaderData();
  return (
    <AppFrame>
      <HomeContent
        quote={data.quote}
        nusdQuote={data.nusdQuote}
        orgs={data.orgs}
        flyQuote={data.flyQuote}
        flyPools={data.flyPools}
      />
    </AppFrame>
  );
}

function HomeContent({
  quote,
  nusdQuote,
  orgs,
  flyQuote,
  flyPools,
}: {
  quote: ReturnType<typeof Route.useLoaderData>["quote"];
  nusdQuote: ReturnType<typeof Route.useLoaderData>["nusdQuote"];
  orgs: ReturnType<typeof Route.useLoaderData>["orgs"];
  flyQuote: FlyQuote | null;
  flyPools: ReturnType<typeof Route.useLoaderData>["flyPools"];
}) {
  const onDonate = useDonate();
  return (
    <main>
      <Hero onDonate={onDonate} />
      <Problem />
      <HowItWorks />
      <Mission />
      <Network orgs={orgs} />
      <Market quote={quote} />
      <NusdMarket quote={nusdQuote} />
      <PoolLab pools={flyPools} />
      <SwapSection initialQuote={flyQuote} priceUsd={quote?.priceUsd} />
      <Token />
      <Transparency onDonate={onDonate} />
      <Projects />
      <Team />
      <Faq />
      <Contact />
    </main>
  );
}
