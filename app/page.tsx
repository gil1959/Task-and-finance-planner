import { LandingNavbar } from "@/components/landing-navbar"
import { LandingHero } from "@/components/landing-hero"
import { LandingFeatures } from "@/components/landing-features"
import { LandingCTA } from "@/components/landing-cta"
import { LandingFooter } from "@/components/landing-footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <main>
        {/* Existing code */}
        <LandingHero />
        <LandingFeatures />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
