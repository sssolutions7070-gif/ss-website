import { Hero } from "@/components/sections/Hero";
import { WaveDivider } from "@/components/graphics/WaveDivider";
import { Industries } from "@/components/sections/Industries";
import { AppDemo } from "@/components/sections/AppDemo";
import { Estimator } from "@/components/sections/Estimator";
import { FAQ } from "@/components/sections/FAQ";
import { BookCall } from "@/components/sections/BookCall";
import { Insights } from "@/components/sections/Insights";
import { ProofBar } from "@/components/sections/ProofBar";
import { Showcase } from "@/components/sections/Showcase";
import { VelocityBand } from "@/components/sections/VelocityBand";
import { Positioning } from "@/components/sections/Positioning";
import { Services } from "@/components/sections/Services";
import { WhatWeBuild } from "@/components/sections/WhatWeBuild";
import { FeaturedReel } from "@/components/sections/FeaturedReel";
import { DigitalMarketing } from "@/components/sections/DigitalMarketing";
import { Consultancy } from "@/components/sections/Consultancy";
import { Process } from "@/components/sections/Process";
import { WhySSSolutions } from "@/components/sections/WhySSSolutions";
import { Engagements } from "@/components/sections/Engagements";
import { Team } from "@/components/sections/Team";
import { DevStack } from "@/components/sections/DevStack";
import { TechStack } from "@/components/sections/TechStack";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Contact } from "@/components/sections/Contact";
import { ZoomIntro } from "@/components/fx/ZoomIntro";
import { JourneyLine } from "@/components/fx/JourneyLine";

export default function HomePage() {
  return (
    <>
      <JourneyLine />
      <Hero />
      <ProofBar />
      <Showcase />
      <Positioning />
      <Services />
      <VelocityBand />
      <ZoomIntro />
      <FeaturedReel />
      <WhatWeBuild />
      <Industries />
      <AppDemo />
      <DigitalMarketing />
      <Consultancy />
      <WaveDivider />
      <Process />
      <Engagements />
      <Estimator />
      <WhySSSolutions />
      <WaveDivider flip />
      <Team />
      <DevStack />
      <TechStack />
      <Insights />
      <FAQ />
      <FinalCTA />
      <BookCall />
      <Contact />
    </>
  );
}
