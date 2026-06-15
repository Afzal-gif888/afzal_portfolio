"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Hexagon } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Experience", href: "#experience" },
    { name: "Contact", href: "#contact" },
  ];

  const [activeSection, setActiveSection] = useState<string>("Home");

  useEffect(() => {
    const ids = navLinks.map((l) => l.href.replace("#", "") || "");
    const sections = ids
      .map((id) => (id ? document.getElementById(id) : document.body))
      .filter(Boolean) as Element[];

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id || "Home";
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            setActiveSection(id === "" ? "Home" : id.charAt(0).toUpperCase() + id.slice(1));
          }
        });
      },
      { root: null, rootMargin: "-20% 0px -55% 0px", threshold: [0.25, 0.4, 0.6] }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm py-3" : "bg-transparent py-5"}`}>
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="group relative flex items-center justify-center w-10 h-10 transition-transform hover:scale-105 duration-300">
          <Hexagon className="absolute inset-0 w-full h-full text-primary stroke-[1.5] group-hover:rotate-90 transition-transform duration-700 ease-in-out" />
          <div className="absolute inset-0 w-full h-full bg-primary/10 blur-[6px] rounded-full group-hover:bg-primary/25 transition-colors duration-500" />
          <span className="relative font-bold text-lg text-foreground font-sans tracking-tighter">A</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => {
            const id = link.href.replace("#", "") || "Home";
            const isActive = (activeSection || "Home").toLowerCase() === id.toLowerCase() || (id === "Home" && activeSection === "Home");

            const base = "text-sm font-medium px-3 py-1 rounded-full border transition-all duration-300 ease-out transform";
            const defaultStyles = "border-transparent text-muted-foreground";
            const hoverStyles = "hover:-translate-y-[2px] hover:text-primary hover:border-[rgba(37,99,235,0.25)] hover:bg-[rgba(37,99,235,0.08)]";
            const activeStyles = "text-primary border-[rgba(37,99,235,0.45)] bg-[rgba(37,99,235,0.12)] ring-1 ring-primary/20";

            return (
              <Link key={link.name} href={link.href} className={`${base} ${defaultStyles} ${hoverStyles} ${isActive ? activeStyles : ""}`}>
                {link.name}
              </Link>
            );
          })}
          <div className="pl-2">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button className="text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border py-4 px-4 flex flex-col gap-3 shadow-lg">
          {navLinks.map((link) => {
            const id = link.href.replace("#", "") || "Home";
            const isActive = (activeSection || "Home").toLowerCase() === id.toLowerCase();
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-base font-medium px-4 py-3 rounded-md transition-all duration-300 ease-out ${isActive ? "text-primary bg-[rgba(37,99,235,0.12)] border-[rgba(37,99,235,0.25)]" : "text-foreground hover:text-primary hover:bg-[rgba(37,99,235,0.08)]"}`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
