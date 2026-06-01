'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TRANSLATIONS = {
  EN: {
    tag:      'OUR SERVICES',
    title:    'What can we help you with?',
    subtitle: 'Access all village governance services from one platform',
    filter:   'Filter services...',
    access:   'Access service →',
    empty:    'No services found for',
    services: [
      { icon: '📋', title: 'Imihigo',             desc: 'Performance contracts tracking and reporting',          color: '#006B3F' },
      { icon: '🏗️', title: 'Umuganda',            desc: 'Community work activities and attendance',              color: '#006B3F' },
      { icon: '💰', title: 'Ibimina',             desc: 'Savings groups management and contributions',           color: '#006B3F' },
      { icon: '🏠', title: 'Ubudehe',             desc: 'Social categorization updates and requests',            color: '#006B3F' },
      { icon: '⚠️', title: 'Emergency Report',    desc: 'Report floods, health issues and disasters',            color: '#C8102E' },
      { icon: '📄', title: 'Service Requests',    desc: 'Document requests and assistance applications',         color: '#006B3F' },
      { icon: '💳', title: 'Penalties & Payments',desc: 'View and pay outstanding penalties via MoMo',           color: '#006B3F' },
      { icon: '📊', title: 'Village Reports',     desc: 'Analytics and performance dashboards',                  color: '#006B3F' },
    ],
  },
  RW: {
    tag:      'SERIVISI ZACU',
    title:    'Twagufasha iki?',
    subtitle: 'Injira serivisi zose z\'umudugudu ahantu hamwe',
    filter:   'Shakisha serivisi...',
    access:   'Injira →',
    empty:    'Nta serivisi yabonetse ya',
    services: [
      { icon: '📋', title: 'Imihigo',             desc: 'Gukurikirana no kugaragaza imishyikirano y\'imikorere',  color: '#006B3F' },
      { icon: '🏗️', title: 'Umuganda',            desc: 'Ibikorwa by\'umuryango no kwitabira',                   color: '#006B3F' },
      { icon: '💰', title: 'Ibimina',             desc: 'Gucunga amatsinda y\'indangamutungo n\'inkunga',         color: '#006B3F' },
      { icon: '🏠', title: 'Ubudehe',             desc: 'Kuvugurura no gusaba icyiciro cy\'ubudehe',              color: '#006B3F' },
      { icon: '⚠️', title: 'Raporo y\'Acura',    desc: 'Gutanga raporo y\'imvura, ubuzima n\'ibyangirika',       color: '#C8102E' },
      { icon: '📄', title: 'Ibisabwa',            desc: 'Gusaba inyandiko n\'ubufasha',                           color: '#006B3F' },
      { icon: '💳', title: 'Amahazabu & Kwishyura',desc: 'Reba no kwishyura amahazabu ukoresheje MoMo',          color: '#006B3F' },
      { icon: '📊', title: 'Raporo z\'Umudugudu', desc: 'Isesengura n\'amakuru y\'imikorere',                    color: '#006B3F' },
    ],
  },
  FR: {
    tag:      'NOS SERVICES',
    title:    'Comment pouvons-nous vous aider?',
    subtitle: 'Accédez à tous les services de gouvernance villageoise depuis une seule plateforme',
    filter:   'Filtrer les services...',
    access:   'Accéder au service →',
    empty:    'Aucun service trouvé pour',
    services: [
      { icon: '📋', title: 'Imihigo',             desc: 'Suivi et rapport des contrats de performance',           color: '#006B3F' },
      { icon: '🏗️', title: 'Umuganda',            desc: 'Activités communautaires et présence',                  color: '#006B3F' },
      { icon: '💰', title: 'Ibimina',             desc: 'Gestion des groupes d\'épargne et contributions',        color: '#006B3F' },
      { icon: '🏠', title: 'Ubudehe',             desc: 'Mises à jour de catégorisation sociale et demandes',     color: '#006B3F' },
      { icon: '⚠️', title: 'Rapport d\'Urgence', desc: 'Signaler inondations, problèmes de santé et catastrophes',color: '#C8102E' },
      { icon: '📄', title: 'Demandes de Service', desc: 'Demandes de documents et demandes d\'assistance',        color: '#006B3F' },
      { icon: '💳', title: 'Amendes & Paiements', desc: 'Voir et payer les amendes via MoMo',                     color: '#006B3F' },
      { icon: '📊', title: 'Rapports Villageois', desc: 'Tableaux de bord analytiques et de performance',         color: '#006B3F' },
    ],
  },
};

type Lang = 'EN' | 'RW' | 'FR';

export const ServicesGrid = ({ lang }: { lang: Lang }) => {
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState<number | null>(null);
  const router = useRouter();
  const t = TRANSLATIONS[lang];

  const filtered = t.services.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '60px 32px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-block', color: '#006B3F', fontSize: '13px',
          fontWeight: '600', letterSpacing: '2px', marginBottom: '8px'
        }}>{t.tag}</div>
        <h2 style={{ fontSize: '32px', color: '#004D2E', marginBottom: '12px' }}>
          {t.title}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '24px' }}>
          {t.subtitle}
        </p>
        <div style={{
          display: 'flex', maxWidth: '400px', margin: '0 auto',
          border: '1px solid #d1fae5', borderRadius: '8px',
          overflow: 'hidden', backgroundColor: 'white'
        }}>
          <span style={{ padding: '0 12px', display: 'flex', alignItems: 'center' }}>🔍</span>
          <input
            type="text"
            placeholder={t.filter}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, padding: '12px 0', border: 'none',
              outline: 'none', fontSize: '14px', color: '#374151'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {filtered.map((service, i) => (
          <div
            key={i}
            onClick={() => router.push('/auth/login')}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              backgroundColor: 'white', borderRadius: '12px', padding: '24px',
              boxShadow: hovered === i ? '0 8px 24px rgba(0,107,63,0.15)' : '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #e5f0e8', borderTop: `3px solid ${service.color}`,
              cursor: 'pointer',
              transform: hovered === i ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{service.icon}</div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#004D2E', marginBottom: '8px' }}>
              {service.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5', marginBottom: '16px' }}>
              {service.desc}
            </p>
            <div style={{ color: '#006B3F', fontSize: '13px', fontWeight: '600' }}>
              {t.access}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          {t.empty} "{search}"
        </div>
      )}
    </div>
  );
};