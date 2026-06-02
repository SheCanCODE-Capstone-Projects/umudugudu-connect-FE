'use client';

import { useState } from 'react';
import Link from 'next/link';

const NAV_LABELS = {
  EN: { home: 'Home', services: 'Services', about: 'About', contact: 'Contact', signin: 'Sign In' },
  RW: { home: 'Ahabanza', services: 'Serivisi', about: 'Abo Turi Bo', contact: 'Twandikire', signin: 'Injira' },
  FR: { home: 'Accueil', services: 'Services', about: 'À Propos', contact: 'Contact', signin: 'Se Connecter' },
};

type Lang = 'EN' | 'RW' | 'FR';

interface NavbarProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

export const Navbar = ({ lang, onLangChange }: NavbarProps) => {
  const t = NAV_LABELS[lang];

  return (
    <header>
      {/* Top utility bar */}
      <div style={{
        backgroundColor: '#004D2E', padding: '6px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ color: '#a8d5b5', fontSize: '12px' }}>
          🇷🇼 Republic of Rwanda — Village Governance Platform
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['EN', 'RW', 'FR'] as Lang[]).map(l => (
            <button key={l} onClick={() => onLangChange(l)} style={{
              background: lang === l ? '#006B3F' : 'transparent',
              color: lang === l ? 'white' : '#a8d5b5',
              border: lang === l ? '1px solid #00A86B' : '1px solid transparent',
              borderRadius: '4px', padding: '3px 10px',
              fontSize: '11px', cursor: 'pointer',
              fontWeight: lang === l ? 'bold' : 'normal'
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Main navbar */}
      <nav style={{
        backgroundColor: 'white', padding: '0 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #006B3F, #00A86B)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '20px',
            boxShadow: '0 4px 12px rgba(0,107,63,0.3)'
          }}>🏘️</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '17px', color: '#004D2E' }}>
              Umudugudu Connect
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.5px' }}>
              VILLAGE GOVERNANCE PLATFORM
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          {[
            { label: t.home,     href: '#home'     },
            { label: t.services, href: '#services' },
            { label: t.about,    href: '#about'    },
            { label: t.contact,  href: '#contact'  },
          ].map((item, i) => (
            <a key={i} href={item.href} style={{
              color: i === 0 ? '#006B3F' : '#374151',
              textDecoration: 'none', fontSize: '14px',
              fontWeight: i === 0 ? '600' : '400',
              borderBottom: i === 0 ? '2px solid #006B3F' : 'none',
              paddingBottom: '4px'
            }}>{item.label}</a>
          ))}
          <Link href="/auth/login" style={{
            backgroundColor: '#006B3F', color: 'white',
            borderRadius: '8px', padding: '10px 20px',
            fontSize: '14px', fontWeight: '600', textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,107,63,0.3)'
          }}>{t.signin}</Link>
        </div>
      </nav>
    </header>
  );
};