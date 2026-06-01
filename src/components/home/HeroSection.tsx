'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TRANSLATIONS = {
  EN: {
    badge:     '🇷🇼 Powered by Rwanda Digital Governance Initiative',
    title1:    'Your Village Services,',
    title2:    'Now Digital',
    subtitle:  'Access all Umudugudu services in one place — from community activities and penalties to emergency reports and service requests.',
    search:    'Search for a service...',
    searchBtn: 'Search',
    tags:      ['Umuganda', 'Penalties', 'Service Requests', 'Emergency'],
  },
  RW: {
    badge:     '🇷🇼 Ishyigikiwe na Rwanda Digital Governance Initiative',
    title1:    'Serivisi z\'Umudugudu,',
    title2:    'Ubu Digitale',
    subtitle:  'Injira serivisi zose z\'umudugudu ahantu hamwe — kuva ku bikorwa by\'umuryango kugeza ku makuru y\'acura.',
    search:    'Shakisha serivisi...',
    searchBtn: 'Shakisha',
    tags:      ['Umuganda', 'Amahazabu', 'Ibisabwa', 'Ibyihutirwa'],
  },
  FR: {
    badge:     '🇷🇼 Propulsé par Rwanda Digital Governance Initiative',
    title1:    'Vos Services Villageois,',
    title2:    'Maintenant Numériques',
    subtitle:  'Accédez à tous les services Umudugudu en un seul endroit — des activités communautaires aux rapports d\'urgence.',
    search:    'Rechercher un service...',
    searchBtn: 'Rechercher',
    tags:      ['Umuganda', 'Amendes', 'Demandes', 'Urgence'],
  },
};

type Lang = 'EN' | 'RW' | 'FR';

interface HeroSectionProps {
  lang: Lang;
}

export const HeroSection = ({ lang }: HeroSectionProps) => {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const t = TRANSLATIONS[lang];

  return (
    <div style={{
      backgroundImage: 'url(/hero-bg.jfif)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '72px 32px 80px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dark overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 50, 30, 0.75)',
        zIndex: 0,
      }}/>

      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)', pointerEvents: 'none', zIndex: 1
      }}/>

      <div style={{
        maxWidth: '800px', margin: '0 auto',
        textAlign: 'center', position: 'relative', zIndex: 2
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(255,255,255,0.15)',
          color: 'white', padding: '6px 16px', borderRadius: '20px',
          fontSize: '13px', marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {t.badge}
        </div>

        {/* Title */}
        <h1 style={{
          color: 'white', fontSize: '48px', fontWeight: 'bold',
          lineHeight: '1.15', marginBottom: '20px',
          textShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}>
          {t.title1}<br />
          <span style={{ color: '#7FFFC4' }}>{t.title2}</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          color: 'rgba(255,255,255,0.9)', fontSize: '18px',
          lineHeight: '1.7', marginBottom: '36px',
          maxWidth: '600px', margin: '0 auto 36px',
          textShadow: '0 1px 4px rgba(0,0,0,0.3)'
        }}>
          {t.subtitle}
        </p>

        {/* Search bar */}
        <div style={{
          display: 'flex', maxWidth: '560px', margin: '0 auto 24px',
          background: 'white', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', overflow: 'hidden'
        }}>
          <span style={{
            padding: '0 16px', fontSize: '18px',
            display: 'flex', alignItems: 'center'
          }}>🔍</span>
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, padding: '16px 0', border: 'none',
              outline: 'none', fontSize: '15px', color: '#374151'
            }}
          />
          <button
            onClick={() => router.push('/auth/login')}
            style={{
              backgroundColor: '#006B3F', color: 'white',
              border: 'none', padding: '0 24px',
              fontSize: '15px', fontWeight: '600', cursor: 'pointer'
            }}
          >{t.searchBtn}</button>
        </div>

        {/* Quick tags */}
        <div style={{
          display: 'flex', gap: '12px',
          justifyContent: 'center', flexWrap: 'wrap'
        }}>
          {t.tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSearch(tag)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '20px', padding: '6px 16px',
                fontSize: '13px', cursor: 'pointer'
              }}
            >{tag}</button>
          ))}
        </div>
      </div>
    </div>
  );
};