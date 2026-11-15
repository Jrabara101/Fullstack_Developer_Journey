import type { Discipline, PersonaContext, PortfolioArtifact } from '../types/portfolio';

export interface PersonaPreset {
  id: string;
  queryString: string;
  label: string;
  context: PersonaContext;
}

export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'default',
    queryString: '',
    label: 'Full Monograph',
    context: {
      active: false,
      tokenKey: '',
      tokenValue: '',
      greetingTitle: 'Selected Works & Visual Studies',
      greetingSubtitle:
        'An unhurried monograph spanning autonomous product systems, typographic craft, and medium-format photography.',
      priorityDisciplines: [],
      priorityTags: [],
    },
  },
  {
    id: 'linear',
    queryString: '?for=linear',
    label: '?for=linear',
    context: {
      active: true,
      tokenKey: 'for',
      tokenValue: 'linear',
      greetingTitle: 'Tailored Portfolio for Linear',
      greetingSubtitle:
        'Sequenced to foreground keyboard-first product systems, Swiss micro-typography, and high-contrast nocturnal UI craft.',
      priorityDisciplines: ['Digital Product / UI', 'Brand & Typography'],
      priorityTags: ['linear', 'systems', 'product-design'],
    },
  },
  {
    id: 'photography',
    queryString: '?lens=photography',
    label: '?lens=photography',
    context: {
      active: true,
      tokenKey: 'lens',
      tokenValue: 'photography',
      greetingTitle: 'Editorial & Fine-Art Photography Lens',
      greetingSubtitle:
        'Curated around analog golden-hour studies, architectural daylight geometry, and 300 DPI archival print plates.',
      priorityDisciplines: ['Editorial Photography'],
      priorityTags: ['photography', 'leica', 'fine-art', 'editorial'],
    },
  },
  {
    id: 'product-design',
    queryString: '?role=product-design',
    label: '?role=product-design',
    context: {
      active: true,
      tokenKey: 'role',
      tokenValue: 'product-design',
      greetingTitle: 'Director & Staff Product Design Dossier',
      greetingSubtitle:
        'Ordered by interaction density, tactile hardware-software cohesion, and measurable design system outcomes.',
      priorityDisciplines: ['Digital Product / UI', 'Motion & 3D'],
      priorityTags: ['product-design', 'linear', 'mobile', 'systems'],
    },
  },
];

/**
 * Parses URL query tokens (`?for=...`, `?lens=...`, `?role=...`) to configure
 * Tailored Portfolio Mode dynamically before rendering.
 */
export function resolvePersonaFromSearch(search: string): PersonaContext {
  const params = new URLSearchParams(search);
  const forClient = params.get('for')?.trim().toLowerCase();
  const lens = params.get('lens')?.trim().toLowerCase();
  const role = params.get('role')?.trim().toLowerCase();

  if (forClient) {
    const matched = PERSONA_PRESETS.find((p) => p.context.tokenValue === forClient);
    if (matched) return matched.context;

    const formattedName = forClient.charAt(0).toUpperCase() + forClient.slice(1);
    return {
      active: true,
      tokenKey: 'for',
      tokenValue: forClient,
      greetingTitle: `Tailored Monograph for ${formattedName}`,
      greetingSubtitle: `Curated selection prioritized for ${formattedName} — elevating system clarity, material restraint, and process transparency.`,
      priorityDisciplines: ['Digital Product / UI', 'Brand & Typography'],
      priorityTags: [forClient, 'systems', 'product-design'],
    };
  }

  if (lens) {
    const matched = PERSONA_PRESETS.find((p) => p.context.tokenValue === lens);
    if (matched) return matched.context;

    const mapLens: Record<string, Discipline[]> = {
      brand: ['Brand & Typography'],
      motion: ['Motion & 3D'],
      ui: ['Digital Product / UI'],
      photography: ['Editorial Photography'],
    };

    return {
      active: true,
      tokenKey: 'lens',
      tokenValue: lens,
      greetingTitle: `Focused Lens: ${lens.replace(/-/g, ' ').toUpperCase()}`,
      greetingSubtitle:
        'Relevant commissions and visual studies elevated to the top of the gallery rhythm.',
      priorityDisciplines: mapLens[lens] ?? ['Editorial Photography'],
      priorityTags: [lens],
    };
  }

  if (role) {
    const matched = PERSONA_PRESETS.find((p) => p.context.tokenValue === role);
    if (matched) return matched.context;

    return {
      active: true,
      tokenKey: 'role',
      tokenValue: role,
      greetingTitle: `Role Dossier — ${role.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`,
      greetingSubtitle:
        'Case studies re-ordered to spotlight structural craft, system tokens, and measurable creative outcomes.',
      priorityDisciplines: ['Digital Product / UI', 'Brand & Typography'],
      priorityTags: [role, 'systems', 'brand'],
    };
  }

  return PERSONA_PRESETS[0].context;
}

/**
 * Re-ranks artifacts when Persona-Aware Mode is active while preserving relative
 * archival catalog order inside each relevance tier.
 */
export function rankArtifactsForPersona(
  artifacts: PortfolioArtifact[],
  persona: PersonaContext
): PortfolioArtifact[] {
  if (!persona.active) return artifacts;

  const scoreArtifact = (item: PortfolioArtifact): number => {
    let score = 0;
    if (persona.priorityDisciplines.includes(item.primaryDiscipline)) score += 6;
    if (item.disciplines.some((d) => persona.priorityDisciplines.includes(d))) score += 2;
    for (const tag of persona.priorityTags) {
      if (item.personaTags.includes(tag)) score += 4;
    }
    if (item.isTopTenHighlight) score += 1;
    return score;
  };

  return [...artifacts].sort((a, b) => scoreArtifact(b) - scoreArtifact(a));
}

