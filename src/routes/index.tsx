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
  PackBand,
  Problem,
  Projects,
  Team,
  Token,
  Transparency,
} from "@/components/sections";
import { listAssociations } from "@/lib/associations";
import { getMarket } from "@/lib/market";
import { fetchFlyQuote, type FlyQuote } from "@/lib/swap-quote";

export const Route = createFileRoute("/")({
  loader: async () => {
    const quote = await getMarket();
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
    return { quote, orgs, flyQuote };
  },
  component: Home,
});

function Home() {
  const data = Route.useLoaderData();
  return (
    <AppFrame>
      <HomeContent quote={data.quote} orgs={data.orgs} flyQuote={data.flyQuote} />
    </AppFrame>
  );
}

function HomeContent({
  quote,
  orgs,
  flyQuote,
}: {
  quote: ReturnType<typeof Route.useLoaderData>["quote"];
  orgs: ReturnType<typeof Route.useLoaderData>["orgs"];
  flyQuote: FlyQuote | null;
}) {
  const onDonate = useDonate();
  return (
    <main>
      <Hero onDonate={onDonate} />
      <PackBand />
      <Problem />
      <HowItWorks />
      <Mission />
      <Network orgs={orgs} />
      <Market quote={quote} />
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
