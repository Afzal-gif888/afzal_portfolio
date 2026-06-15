import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

const About = dynamic(() => import("@/components/About"), { ssr: true });
const Skills = dynamic(() => import("@/components/Skills"), { ssr: true });
const Projects = dynamic(() => import("@/components/Projects"), { ssr: true });
const ExperienceSection = dynamic(() => import("@/components/Experience"), { ssr: true });
const Certificates = dynamic(() => import("@/components/Certificates"), { ssr: true });
const Achievements = dynamic(() => import("@/components/Achievements"), { ssr: true });
const Contact = dynamic(() => import("@/components/Contact"), { ssr: true });

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans pt-[80px]">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <ExperienceSection />
      <Certificates />
      <Achievements />
      <Contact />
      <Footer />
    </main>
  );
}
