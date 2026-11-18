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
  Network,
  Token,
  Transparency,
} from "@/components/sections";
import { useFlyQuote } from "@/lib/use-fly-quote";
import { publicPageHeaders } from "@/lib/cache";

export const Route = createFileRoute("/")({
  component: Home,
  headers: publicPageHeaders(),
  head: () => ({
    links: [
      { rel: "canonical", href: "https://nexafly.org/" },
      { rel: "preload", href: "/hero.jpg", as: "image", fetchPriority: "high" },
    ],
  }),
});

function Home() {
  return (
    <AppFrame>
      <HomeContent />
    </AppFrame>
  );
}

function HomeContent() {
  const onDonate = useDonate();
  const quote = useFlyQuote();
  return (
    <main>
      <Hero onDonate={onDonate} quote={quote} />
      <HowItWorks />
      <Network />
      <Market quote={quote} />
      <HowToBuy />
      <SwapSection priceUsd={quote?.priceUsd} />
      <Token />
      <Transparency onDonate={onDonate} />
      <Faq />
      <Contact />
    </main>
  );
}