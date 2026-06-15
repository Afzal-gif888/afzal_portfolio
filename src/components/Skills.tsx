"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getSkillIcon } from "@/lib/skill-icons";

interface Skill {
  id: string;
  name: string;
  enabled?: boolean;
  order?: number;
}

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const q = query(collection(db, "skills"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedSkills: Skill[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedSkills.push({ id: docSnap.id, ...docSnap.data() } as Skill);
        });
        setSkills(fetchedSkills);
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSkills();
  }, []);

  const visibleSkills = skills
    .filter((skill) => skill.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (loading || visibleSkills.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const skillVariants: Variants = {
    hidden: { opacity: 0, scale: 0.92, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.45 },
    },
  };

  // Color palette used for skill borders. Stable mapping per skill name.
  const PALETTE = [
    "#60a5fa", // blue-400
    "#7c3aed", // purple-600
    "#06b6d4", // cyan-500
    "#34d399", // green-400
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#a78bfa", // violet-300
    "#f97316", // orange-500
  ];

  const getColorForSkill = (name: string) => {
    const s = name.trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
    return PALETTE[hash % PALETTE.length];
  };

  return (
    <section id="skills" className="w-full max-w-[1200px] mx-auto px-6 py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="mb-6">
          <motion.h2 variants={titleVariants} className="text-3xl font-bold">
            Skills
          </motion.h2>
        </div>

        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          {visibleSkills.map((skill) => {
            const Icon = getSkillIcon(skill.name);
            const color = getColorForSkill(skill.name);

            return (
              <motion.div
                key={skill.id}
                variants={skillVariants}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-3 px-3 py-2 text-sm text-foreground rounded-lg border-2"
                style={{ borderColor: color }}
                animate={{ boxShadow: [
                  `0 0 0 0 ${color}22`,
                  `0 6px 18px 6px ${color}40`,
                  `0 0 0 0 ${color}22`,
                ] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex h-8 w-8 items-center justify-center text-lg" style={{ color }}>
                  <Icon />
                </div>
                <span>{skill.name}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
