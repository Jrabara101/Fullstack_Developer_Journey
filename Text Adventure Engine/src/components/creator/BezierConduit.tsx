import { RoomExit, RoomNode } from '../../types/engine';

export interface BezierConduitProps {
  fromRoom: RoomNode;
  toRoom: RoomNode;
  exit: RoomExit;
  isSelected: boolean;
}

export function BezierConduit({
  fromRoom,
  toRoom,
  exit,
  isSelected,
}: BezierConduitProps) {
  // Dimensions of room cards: 200px width x 110px height
  const CARD_WIDTH = 200;
  const CARD_HEIGHT = 110;

  // Compute anchor port on fromRoom based on exit direction
  let x1 = fromRoom.editorPosition.x + CARD_WIDTH / 2;
  let y1 = fromRoom.editorPosition.y + CARD_HEIGHT / 2;

  switch (exit.direction) {
    case 'north':
      x1 = fromRoom.editorPosition.x + CARD_WIDTH / 2;
      y1 = fromRoom.editorPosition.y;
      break;
    case 'south':
      x1 = fromRoom.editorPosition.x + CARD_WIDTH / 2;
      y1 = fromRoom.editorPosition.y + CARD_HEIGHT;
      break;
    case 'east':
      x1 = fromRoom.editorPosition.x + CARD_WIDTH;
      y1 = fromRoom.editorPosition.y + CARD_HEIGHT / 2;
      break;
    case 'west':
      x1 = fromRoom.editorPosition.x;
      y1 = fromRoom.editorPosition.y + CARD_HEIGHT / 2;
      break;
    case 'up':
      x1 = fromRoom.editorPosition.x + CARD_WIDTH - 20;
      y1 = fromRoom.editorPosition.y;
      break;
    case 'down':
      x1 = fromRoom.editorPosition.x + 20;
      y1 = fromRoom.editorPosition.y + CARD_HEIGHT;
      break;
  }

  // Target center
  const x2 = toRoom.editorPosition.x + CARD_WIDTH / 2;
  const y2 = toRoom.editorPosition.y + CARD_HEIGHT / 2;

  // Compute smooth cubic bezier control points
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx1 = x1 + dx * 0.45;
  const cy1 = y1 + dy * 0.1;
  const cx2 = x1 + dx * 0.55;
  const cy2 = y2 - dy * 0.1;

  const pathD = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const strokeColor = exit.isLocked
    ? '#EF4444'
    : isSelected
    ? '#F59E0B'
    : '#38BDF8';

  return (
    <g className="transition-all select-none pointer-events-none">
      {/* Outer Glow Line */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isSelected ? '6' : '3'}
        opacity={isSelected ? '0.6' : '0.2'}
        strokeLinecap="round"
      />

      {/* Main Conduit Line */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isSelected ? '2.5' : '1.8'}
        strokeDasharray={exit.isLocked ? '6 4' : 'none'}
        strokeLinecap="round"
      />

      {/* Conduit Label & Lock Badge at midpoint */}
      <g transform={`translate(${midX}, ${midY})`} className="pointer-events-auto">
        <rect
          x="-36"
          y="-11"
          width="72"
          height="22"
          rx="11"
          fill="#0E121B"
          stroke={strokeColor}
          strokeWidth="1.2"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fill={exit.isLocked ? '#F87171' : '#E2E8F0'}
          fontSize="9.5"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {exit.isLocked ? `🔒 ${exit.direction.toUpperCase()}` : exit.direction.toUpperCase()}
        </text>
      </g>
    </g>
  );
}
