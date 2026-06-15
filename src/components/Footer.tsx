"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getIcon } from "@/lib/icon-map";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const q = query(collection(db, "socialLinks"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const links: SocialLink[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<SocialLink, 'id'>;
          if (data.isActive && data.platform !== "LinkedIn" && data.platform !== "GitHub") {
            links.push({ ...data, id: docSnap.id });
          }
        });
        setSocialLinks(links);
      } catch (error) {
        console.error("Error fetching social links:", error);
      }
    }
    fetchLinks();
  }, []);

  return (
    <footer className="border-t bg-card">
      <div className="w-full max-w-[1200px] mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Afzal. All rights reserved.
        </p>

        {socialLinks.length > 0 && (
          <div className="flex gap-4">
            {socialLinks.map((link) => {
              const Icon = getIcon(link.icon);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={link.platform}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </footer>
  );
}
