"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Award, Briefcase, Cpu, Cloud, Sparkles, Star, CalendarDays, type LucideIcon } from "lucide-react";

interface AboutHeader {
  subtitle?: string;
}

interface AboutProfile {
  imageUrl?: string;
  fullName?: string;
  title?: string;
  specialization?: string;
  status?: string;
  location?: string;
}

interface AboutSummary {
  summary?: string;
}

interface AboutCareerObjective {
  description?: string;
}

interface AboutService {
  id: string;
  icon?: string;
  title?: string;
  description?: string;
  order?: number;
}

interface TimelineItem {
  id: string;
  year?: string;
  title?: string;
  description?: string;
  order?: number;
}

export default function About() {
  const [header, setHeader] = useState<AboutHeader | null>(null);
  const [profile, setProfile] = useState<AboutProfile | null>(null);
  const [summary, setSummary] = useState<AboutSummary | null>(null);
  const [careerObjective, setCareerObjective] = useState<AboutCareerObjective | null>(null);
  const [services, setServices] = useState<AboutService[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const headerSnap = await getDoc(doc(db, "aboutHeader", "main"));
        setHeader(headerSnap.exists() ? { subtitle: (headerSnap.data() as any)?.subtitle ?? "" } : { subtitle: "" });

        const profileSnap = await getDoc(doc(db, "aboutProfile", "main"));
        setProfile(profileSnap.exists() ? (profileSnap.data() as AboutProfile) : { imageUrl: "", fullName: "", title: "", specialization: "", status: "", location: "" });

        const summarySnap = await getDoc(doc(db, "aboutSummary", "main"));
        setSummary(summarySnap.exists() ? { summary: (summarySnap.data() as any)?.summary ?? "" } : { summary: "" });

        const careerSnap = await getDoc(doc(db, "aboutCareerObjective", "main"));
        setCareerObjective(careerSnap.exists() ? { description: (careerSnap.data() as any)?.description ?? "" } : { description: "" });

        const servicesSnap = await getDocs(query(collection(db, "aboutServices"), orderBy("order", "asc")));
        setServices(servicesSnap.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<AboutService, "id">;
          return { id: docSnap.id, ...data };
        }));

        const timelineSnap = await getDocs(query(collection(db, "aboutTimeline"), orderBy("order", "asc")));
        const items = timelineSnap.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<TimelineItem, "id">;
          return { id: docSnap.id, ...data };
        });
        console.log("Timeline items loaded:", items);
        setTimelineItems(items);
      } catch (error) {
        console.error("Error loading About content:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section id="about" className="w-full max-w-[1200px] mx-auto px-6 py-12">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="space-y-4 text-center mb-14">
          <p className="text-sm uppercase tracking-[0.28em] text-primary">About</p>
          <h2 className="text-4xl md:text-5xl font-bold">Professional Profile</h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">{header?.subtitle}</p>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Profile (Two Separate Cards) */}
          <div className="space-y-6">
            {/* Card 1: Profile Information */}
            <motion.div variants={cardVariants}>
              <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm h-fit">
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold">{profile?.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.title}</p>
                  <div className="grid gap-2 text-sm text-muted-foreground">
                    <p><span className="font-semibold text-foreground">Specialization:</span> {profile?.specialization}</p>
                    <p><span className="font-semibold text-foreground">Status:</span> {profile?.status}</p>
                    <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-primary" />{profile?.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Who am I */}
            <motion.div variants={cardVariants}>
              <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm h-fit">
                <h3 className="text-xl font-semibold mb-3">Who am I</h3>
                <p className="text-sm text-muted-foreground leading-7">{summary?.summary}</p>
              </div>
            </motion.div>
          </div>

          {/* Middle Column - Career Vision & What I Build */}
          <motion.div variants={cardVariants} className="space-y-6">
            <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Career Vision</h3>
              <p className="text-sm text-muted-foreground leading-7">{careerObjective?.description}</p>
            </div>

            <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h3 className="text-xl font-semibold">What I Build</h3>
              </div>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <motion.div key={service.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }} className="rounded-[20px] border border-border bg-background p-4 shadow-sm hover:shadow-md transition-shadow">
                    <motion.div whileHover={{ scale: 1.02 }} className="flex gap-3">
                      <div className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-primary">
                        {renderIcon(service.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold mb-1">{service.title}</h4>
                        <p className="text-xs text-muted-foreground leading-5">{service.description}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Journey Timeline */}
          <motion.div variants={cardVariants}>
            {timelineItems.length > 0 ? (
              <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm h-fit">
              <h3 className="text-xl font-semibold mb-6">My Journey</h3>
              <div className="space-y-4">
                {timelineItems.map((item, index) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }} className="flex gap-3">
                    {/* Timeline dot and connector */}
                    <div className="flex flex-col items-center shrink-0 pt-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold shadow-md shrink-0 text-center leading-tight">
                        <span>{item.year ? item.year.toString().replace(/\s+/g, '\n') : '---'}</span>
                      </div>
                      {index !== timelineItems.length - 1 && (
                        <div className="mt-3 mb-2 w-px h-14 bg-linear-to-b from-primary/50 to-transparent" />
                      )}
                    </div>
                    
                    {/* Content card */}
                    <div className="flex-1 pb-2">
                      <motion.div whileHover={{ y: -2 }} className="rounded-[16px] border border-border bg-background p-3 shadow-sm hover:shadow-md transition-shadow min-w-0">
                        <h4 className="text-sm font-semibold text-foreground wrap-break-word">{item.title || 'Untitled'}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1 wrap-break-word whitespace-normal overflow-hidden">
                          {item.description || 'No description'}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            ) : (
              <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">My Journey</h3>
                <p className="text-xs text-muted-foreground">No journey items added yet</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

const iconMap: Record<string, LucideIcon> = {
  award: Award,
  briefcase: Briefcase,
  cpu: Cpu,
  cloud: Cloud,
  sparkles: Sparkles,
  star: Star,
  calendar: CalendarDays,
};

function renderIcon(name?: string) {
  const normalized = (name || "").trim().toLowerCase();
  const Icon = iconMap[normalized] ?? Star;
  return <Icon className="h-6 w-6" />;
}
