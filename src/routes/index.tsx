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
import { listAssociations } from "@/lib/associations";
import { getMarket, getNusdMarket } from "@/lib/market";
import { listFlyPools } from "@/lib/pools";
import { fetchFlyQuote, type FlyQuote } from "@/lib/swap-quote";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [quote, nusdQuote] = await Promise.all([getMarket(), getNusdMarket()]);
    let flyPools: Awaited<ReturnType<typeof listFlyPools>> = [];
    try {
      flyPools = await listFlyPools();
    } catch {
      flyPools = [];
    }
    let orgs: Awaited<ReturnType<typeof listAssociations>> = [];
    try {
      orgs = await listAssociations();
    } catch {
      orgs = [];
    }
    let flyQuote: FlyQuote | null = null;
    try {
      flyQuote = await fetchFlyQuote("10", "USDC");
    } catch {
      flyQuote = null;
    }
    return { quote, nusdQuote, orgs, flyQuote, flyPools };
  },
  component: Home,
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
