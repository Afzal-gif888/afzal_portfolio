"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Download, Mail } from "lucide-react";
import { getIcon } from "@/lib/icon-map";
import { useEffect, useState, type MouseEvent } from "react";
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { trackEvent, EVENTS } from "@/lib/analytics";

interface ProfileData {
  name: string;
  title: string;
  intro: string;
  resumeUrl?: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export default function Hero() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Profile
        const docRef = doc(db, "profile", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as ProfileData);
        }

        // Fetch Social Links
        const q = query(collection(db, "socialLinks"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedLinks: SocialLink[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<SocialLink, 'id'>;
          if (data.isActive) {
            fetchedLinks.push({ ...data, id: docSnap.id });
          }
        });
        setSocialLinks(fetchedLinks);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    trackEvent(EVENTS.PAGE_VIEW);
  }, []);

  const name = profile?.name || "Afzal";
  const title = profile?.title || "Software Engineer";
  const intro = profile?.intro || "I build professional, scalable, and beautifully designed web applications. Passionate about clean code, modern architecture, and creating exceptional user experiences.";
  const profileImage = "/profile.jpg";

  const handleDownload = async (e: MouseEvent<HTMLAnchorElement>) => {
    if (!profile?.resumeUrl) return;
    e.preventDefault();
    
    try {
      // Fetch the file to force download (bypasses browser PDF viewer)
      const response = await fetch(profile.resumeUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      // Extract original filename or default to Resume.pdf
      const filename = profile.resumeUrl.split('/').pop() || "Resume.pdf";
      a.download = filename.includes('.') ? filename : `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      
      trackEvent(EVENTS.RESUME_DOWNLOAD);
    } catch (error) {
      console.error("Download failed, opening in new tab instead:", error);
      // Fallback to opening in a new tab
      window.open(profile.resumeUrl, "_blank");
      trackEvent(EVENTS.RESUME_DOWNLOAD);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-6 py-[60px] md:py-[100px] flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12 lg:gap-20">

      {/* Left Content (55%) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1"
      >
        <div className="p-6 md:p-8">
          <motion.h1 variants={itemVariants} className="text-[42px] md:text-[64px] font-bold text-foreground leading-tight mb-2 font-sans">
            Hi, I&apos;m <span className="text-primary">{name}</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-primary font-medium mb-6">
            {title}
          </motion.p>
          <motion.p variants={itemVariants} className="text-muted-foreground text-lg mb-6 max-w-[600px] leading-relaxed">
            {intro}
          </motion.p>

          {/* Dynamic Social Links */}
          {socialLinks.length > 0 && (
            <motion.div variants={itemVariants} className="flex gap-4 mb-8">
              {socialLinks.map((link) => {
                const Icon = getIcon(link.icon);
                return (
                  <motion.a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noreferrer"
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                    aria-label={link.platform}
                    onClick={() => {
                      trackEvent(EVENTS.SOCIAL_CLICK);
                      if (link.platform.toLowerCase().includes("linkedin")) trackEvent(EVENTS.LINKEDIN_CLICK);
                      if (link.platform.toLowerCase().includes("github")) trackEvent(EVENTS.GITHUB_CLICK);
                      if (link.platform.toLowerCase().includes("leetcode")) trackEvent(EVENTS.LEETCODE_CLICK);
                    }}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.a>
                );
              })}
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href={profile?.resumeUrl || "#"} onClick={handleDownload}>
              <Button size="lg" className="rounded-lg shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="mr-2 h-5 w-5" /> Download Resume
              </Button>
            </motion.a>
            <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="#contact">
              <Button size="lg" variant="outline" className="rounded-lg shadow-sm bg-background text-foreground border-border hover:bg-muted">
                <Mail className="mr-2 h-5 w-5" /> Contact Me
              </Button>
            </motion.a>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Content - Profile Image (45%) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3, type: "spring", stiffness: 100 }}
        className="w-full md:w-[45%] flex justify-center md:justify-end"
      >
        <div className="relative">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="relative w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full overflow-hidden"
          >
            {loading ? (
              <div className="w-full h-full bg-muted animate-pulse rounded-full"></div>
            ) : (
              <Image
                src={profileImage}
                alt="Professional Portrait"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 280px, 380px"
              />
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
