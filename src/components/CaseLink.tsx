import { ScrambleFace } from './ScramblePress';
import { useHudScramble } from './useHudScramble';

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 9h11M9.5 4.5 14 9l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Item = {
  title: string;
  tag: string;
  result: string;
  href: string;
};

/** Строка кейса со scramble заголовка (остров). */
export default function CaseLink({ item }: { item: Item }) {
  const { ref, replay } = useHudScramble(item.title);

  return (
    <a className="case-link" href={item.href} onMouseEnter={() => replay()}>
      <div className="container case-link__inner">
        <div className="case-link__meta">
          <span className="label case-link__tag">{item.tag}</span>
          <span className="case-link__go" aria-hidden="true">
            <ArrowIcon />
          </span>
        </div>
        <h3 className="case-link__title">
          <ScrambleFace text={item.title} liveRef={ref} />
        </h3>
        <p className="case-link__result">{item.result}</p>
      </div>
    </a>
  );
}
