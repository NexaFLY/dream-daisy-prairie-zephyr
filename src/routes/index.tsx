import { createFileRoute } from "@tanstack/react-router";
import { AppFrame, useDonate } from "@/components/app-frame";
import { SwapSection } from "@/components/swap-widget";
import {
  Contact,
  Faq,
  Hero,
  HowItWorks,
  HowToBuy,
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
import { getMarket } from "@/lib/market";
import { useFlyQuote } from "@/lib/use-fly-quote";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [quote, orgs] = await Promise.all([
      getMarket().catch(() => null),
      listHomeAssociations().catch(() => [] as Awaited<ReturnType<typeof listHomeAssociations>>),
    ]);
    return { quote, orgs };
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
      <HomeContent quote={data.quote} orgs={data.orgs} />
    </AppFrame>
  );
}

function HomeContent({
  quote,
  orgs,
}: {
  quote: ReturnType<typeof Route.useLoaderData>["quote"];
  orgs: ReturnType<typeof Route.useLoaderData>["orgs"];
}) {
  const onDonate = useDonate();
  useFlyQuote(quote);
  return (
    <main>
      <Hero onDonate={onDonate} quote={quote} />
      <Problem />
      <HowItWorks />
      <Mission />
      <Network orgs={orgs} />
      <Market quote={quote} />
      <HowToBuy />
      <NusdMarket />
      <PoolLab />
      <SwapSection priceUsd={quote?.priceUsd} />
      <Token />
      <Transparency onDonate={onDonate} />
      <Projects />
      <Team />
      <Faq />
      <Contact />
    </main>
  );
}