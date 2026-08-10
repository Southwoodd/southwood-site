import { useReducedMotion } from 'motion/react';
import './SignalGraph.css';

type Node = {
  id: string;
  label: string;
  x: number;
  y: number;
  hub?: boolean;
};

const NODES: Node[] = [
  { id: 'site', label: 'Сайт', x: 14, y: 58 },
  { id: 'bots', label: 'Боты', x: 28, y: 28 },
  { id: 'crm', label: 'CRM', x: 42, y: 52, hub: true },
  { id: 'funnel', label: 'Воронка', x: 58, y: 30 },
  { id: 'docs', label: 'Документы', x: 68, y: 58 },
  { id: 'kp', label: 'КП', x: 84, y: 38 },
  { id: 'rules', label: 'Регламенты', x: 52, y: 78 },
  { id: 'kb', label: 'База знаний', x: 74, y: 82 },
  { id: 'ai', label: 'AI', x: 34, y: 78 },
];

const EDGES: [string, string][] = [
  ['site', 'bots'],
  ['site', 'crm'],
  ['bots', 'crm'],
  ['crm', 'funnel'],
  ['crm', 'docs'],
  ['funnel', 'kp'],
  ['docs', 'kp'],
  ['crm', 'rules'],
  ['rules', 'kb'],
  ['docs', 'kb'],
  ['ai', 'crm'],
  ['ai', 'bots'],
  ['ai', 'rules'],
];

function nodeMap() {
  return Object.fromEntries(NODES.map((n) => [n.id, n]));
}

export default function SignalGraph() {
  const reduce = useReducedMotion();
  const map = nodeMap();

  return (
    <div
      className={`signal-graph${reduce ? ' signal-graph--static' : ''}`}
      aria-hidden="true"
    >
      <svg
        className="signal-graph__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="signal-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.35" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {EDGES.map(([a, b], i) => {
          const from = map[a];
          const to = map[b];
          if (!from || !to) return null;
          return (
            <g key={`${a}-${b}`} className="signal-graph__edge">
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className="signal-graph__line"
              />
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className="signal-graph__pulse-line"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
            </g>
          );
        })}

        {NODES.map((n, i) => (
          <g
            key={n.id}
            className={`signal-graph__node${n.hub ? ' is-hub' : ''}`}
            style={{ animationDelay: `${i * 0.28}s` }}
            transform={`translate(${n.x} ${n.y})`}
          >
            <circle className="signal-graph__ring" r={n.hub ? 2.4 : 1.8} />
            <circle className="signal-graph__dot" r={n.hub ? 0.85 : 0.55} />
            <text className="signal-graph__label" x={0} y={n.hub ? 4.8 : 3.8}>
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
