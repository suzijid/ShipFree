import Navbar from './(site)/navbar'
import Hero from './(site)/hero'
import HowItWorks from './(site)/how-it-works'
import Features from './(site)/features'
import Pricing from './(site)/pricing'
import Testimonials from './(site)/testimonials'
import FAQ from './(site)/faq'
import Footer from './(site)/footer'
import { GridLayout, SectionDivider } from './(site)/grid-layout'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <GridLayout>
      <Navbar />
      <Hero />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider />
      <Features />
      <SectionDivider />
      <Pricing />
      <SectionDivider />
      <Testimonials />
      <FAQ />
      <Footer />
    </GridLayout>
  )
}
