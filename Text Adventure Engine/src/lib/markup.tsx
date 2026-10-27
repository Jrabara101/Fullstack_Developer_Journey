import React from 'react';
import { StoryCartridge } from '../types/engine';
import { sound } from './audio';

export interface MarkupParserContext {
  cartridge: StoryCartridge;
  flags: Record<string, boolean>;
  variables: Record<string, number>;
  inventoryIds: string[];
  currentRoomId: string;
  onEntityClick?: (entityId: string, actions: string[], event: React.MouseEvent) => void;
}

// 1. Preprocess conditional blocks: {if condition}...{else}...{/if}
export function evaluateConditionMarkup(
  text: string,
  flags: Record<string, boolean>,
  variables: Record<string, number>,
  inventoryIds: string[]
): string {
  // Regex for {if condition}trueContent({else}falseContent)?{/if}
  const conditionRegex = /\{if\s+([^}]+)\}([\s\S]*?)(?:\{else\}([\s\S]*?))?\{\/if\}/gi;

  return text.replace(conditionRegex, (_, conditionExpr, trueBranch, falseBranch = '') => {
    const expr = conditionExpr.trim();
    let conditionMet = false;

    // Flag check: flag:flag_name or !flag:flag_name
    if (expr.startsWith('!flag:')) {
      const flagName = expr.slice(6).trim();
      conditionMet = !flags[flagName];
    } else if (expr.startsWith('flag:')) {
      const flagName = expr.slice(5).trim();
      conditionMet = !!flags[flagName];
    } else if (expr.startsWith('!item:')) {
      const itemId = expr.slice(6).trim();
      conditionMet = !inventoryIds.includes(itemId);
    } else if (expr.startsWith('item:')) {
      const itemId = expr.slice(5).trim();
      conditionMet = inventoryIds.includes(itemId);
    } else if (expr.startsWith('var:')) {
      // e.g. var:gears>=2, var:turn>5
      const match = expr.slice(4).match(/([a-zA-Z0-9_]+)\s*(>=|<=|>|<|==|!=)\s*(\d+)/);
      if (match) {
        const [, varName, op, valStr] = match;
        const currentVal = variables[varName] ?? 0;
        const targetVal = parseInt(valStr, 10);
        switch (op) {
          case '>=': conditionMet = currentVal >= targetVal; break;
          case '<=': conditionMet = currentVal <= targetVal; break;
          case '>': conditionMet = currentVal > targetVal; break;
          case '<': conditionMet = currentVal < targetVal; break;
          case '==': conditionMet = currentVal === targetVal; break;
          case '!=': conditionMet = currentVal !== targetVal; break;
        }
      }
    } else {
      // Default to flag lookup directly
      if (expr.startsWith('!')) {
        conditionMet = !flags[expr.slice(1).trim()];
      } else {
        conditionMet = !!flags[expr];
      }
    }

    return conditionMet ? trueBranch : falseBranch;
  });
}

// 2. Parse kinetic effects and inline entity links into React nodes
export function renderInteractiveProse(
  rawMarkup: string,
  context: MarkupParserContext
): React.ReactNode {
  // Preprocess conditional tags first
  const evaluatedText = evaluateConditionMarkup(
    rawMarkup,
    context.flags,
    context.variables,
    context.inventoryIds
  );

  // Tokenize combined regex:
  // - Entity: \[\[([^\]]+)\]\]
  // - Kinetic shake: \[shake\]([\s\S]*?)\[\/shake\]
  // - Kinetic glow: \[glow\]([\s\S]*?)\[\/glow\]
  // - Kinetic ember: \[ember\]([\s\S]*?)\[\/ember\]
  // - Kinetic ghost: \[ghost\]([\s\S]*?)\[\/ghost\]
  // - Kinetic gold: \[gold\]([\s\S]*?)\[\/gold\]
  // - Drop cap: \[dropcap\](.)\[\/dropcap\]
  // - Bold: \*\*([^*]+)\*\*
  // - Italic: \*([^*]+)\*
  const tokenRegex = /(\[\[[\s\S]*?\]\]|\[shake\][\s\S]*?\[\/shake\]|\[glow\][\s\S]*?\[\/glow\]|\[ember\][\s\S]*?\[\/ember\]|\[ghost\][\s\S]*?\[\/ghost\]|\[gold\][\s\S]*?\[\/gold\]|\[dropcap\].\[\/dropcap\]|\*\*[^*]+\*\*|\*[^*]+\*)/g;

  const parts = evaluatedText.split(tokenRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // 1. Entity Link: [[Display Name|id:entity_id|actions:inspect,take,use]]
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const inner = part.slice(2, -2);
          const segments = inner.split('|').map(s => s.trim());
          const displayName = segments[0];

          let entityId = '';
          let explicitActions: string[] = [];

          for (let i = 1; i < segments.length; i++) {
            const seg = segments[i];
            if (seg.startsWith('id:')) {
              entityId = seg.slice(3).trim();
            } else if (seg.startsWith('actions:')) {
              explicitActions = seg.slice(8).split(',').map(a => a.trim().toLowerCase());
            }
          }

          // If no id was provided, attempt to match entity in cartridge by name
          if (!entityId) {
            const entMatch = Object.values(context.cartridge.entities).find(
              e => e.name.toLowerCase() === displayName.toLowerCase() ||
                   e.id.toLowerCase() === displayName.toLowerCase()
            );
            if (entMatch) {
              entityId = entMatch.id;
            }
          }

          const entity = entityId ? context.cartridge.entities[entityId] : null;
          const isInSatchel = context.inventoryIds.includes(entityId);
          const isTakeableInRoom = !!entity?.isTakeable && !isInSatchel;

          // Determine actions available
          const actions: string[] = explicitActions.length > 0 ? explicitActions : [
            'inspect',
            ...(isTakeableInRoom ? ['take'] : []),
            ...(entity?.isUsable ? ['use'] : []),
            ...(isInSatchel && entity?.combineWithEntityId ? ['combine'] : []),
          ];

          return (
            <button
              key={`ent-${index}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playParchmentTap();
                if (context.onEntityClick && entityId) {
                  context.onEntityClick(entityId, actions, e);
                }
              }}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 ml-0.5 mr-0 align-baseline rounded text-sky-300 bg-sky-950/40 border-b border-sky-400/60 hover:bg-sky-900/50 hover:text-sky-100 hover:border-sky-300 transition-all font-sans text-base font-semibold group cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-400"
              title={`Click to interact with ${displayName}`}
            >
              <span className="text-sky-400/80 group-hover:text-amber-400 transition-colors text-xs">◈</span>
              <span>{displayName}</span>
            </button>
          );
        }

        // 2. Kinetic Shake
        if (part.startsWith('[shake]') && part.endsWith('[/shake]')) {
          const content = part.slice(7, -8);
          return (
            <span key={`shake-${index}`} className="animate-kinetic-shake inline-block text-peril-light font-semibold px-0.5">
              {content}
            </span>
          );
        }

        // 3. Kinetic Glow
        if (part.startsWith('[glow]') && part.endsWith('[/glow]')) {
          const content = part.slice(6, -7);
          return (
            <span key={`glow-${index}`} className="animate-glow-pulse inline-block text-entity-light font-medium px-0.5 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]">
              {content}
            </span>
          );
        }

        // 4. Kinetic Ember
        if (part.startsWith('[ember]') && part.endsWith('[/ember]')) {
          const content = part.slice(7, -8);
          return (
            <span key={`ember-${index}`} className="animate-ember-glow inline-block text-amber-400 font-semibold px-0.5">
              {content}
            </span>
          );
        }

        // 5. Kinetic Ghost
        if (part.startsWith('[ghost]') && part.endsWith('[/ghost]')) {
          const content = part.slice(7, -8);
          return (
            <span key={`ghost-${index}`} className="animate-ghost-fade inline-block italic text-slate-400 px-0.5 tracking-wide">
              {content}
            </span>
          );
        }

        // 6. Kinetic Gold
        if (part.startsWith('[gold]') && part.endsWith('[/gold]')) {
          const content = part.slice(6, -7);
          return (
            <span key={`gold-${index}`} className="text-amber-300 font-semibold drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] px-0.5">
              {content}
            </span>
          );
        }

        // 7. Drop Cap: [dropcap]L[/dropcap]
        if (part.startsWith('[dropcap]') && part.endsWith('[/dropcap]')) {
          const char = part.slice(9, -10);
          return (
            <span key={`drop-${index}`} className="float-left font-serif text-5xl leading-[0.8] pt-1 pr-3 text-amber-400 font-bold drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
              {char}
            </span>
          );
        }

        // 8. Markdown Bold: **text**
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={`b-${index}`} className="font-bold text-prose-display">
              {part.slice(2, -2)}
            </strong>
          );
        }

        // 9. Markdown Italic: *text*
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={`i-${index}`} className="italic text-slate-300">
              {part.slice(1, -1)}
            </em>
          );
        }

        // Plain text: preserve line breaks
        const lines = part.split('\n');
        return (
          <React.Fragment key={`txt-${index}`}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={`l-${lIdx}`}>
                {line}
                {lIdx < lines.length - 1 && <br className="my-2" />}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
}
