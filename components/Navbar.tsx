"use client";

import { useEffect, useState } from "react";

const links = [
  { id: "editor", label: "Éditeur", icon: "✎" },
  { id: "templates", label: "Templates", icon: "▦" },
  { id: "commit-dates", label: "Dates & commits", icon: "▤" },
  { id: "gallery", label: "Mes motifs", icon: "♡" },
];

export default function Navbar() {
  const [active, setActive] = useState("editor");
  useEffect(() => {
    function update() {
      const ordered = links
        .map((link) => document.getElementById(link.id))
        .filter((node): node is HTMLElement => !!node)
        .sort((a, b) => a.offsetTop - b.offsetTop);
      const current = ordered
        .filter((node) => node.getBoundingClientRect().top <= 180)
        .at(-1);
      setActive(current?.id ?? "editor");
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <header className="site-header arcade-navbar">
      <div className="app-container navbar-inner">
        <a href="#" className="brand" aria-label="Gitvinci, accueil">
          <span className="brand-mark" aria-hidden="true">
            G<span>▝</span>
          </span>
          <span>
            gitvinci<span className="brand-dot">.</span>
            <small>CONTRIBUTION ART STUDIO</small>
          </span>
        </a>
        <nav aria-label="Navigation principale">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              aria-current={active === link.id ? "location" : undefined}
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </a>
          ))}
        </nav>
        <span className="navbar-tag">
          <span aria-hidden="true">●</span> MODE CRÉATIF
        </span>
      </div>
    </header>
  );
}
