interface Props {
  id: string;
  label: string;
}

export default function StubSection({ id, label }: Props) {
  return (
    <section className="section" id={id} aria-label={label}>
      <div className="container stub">{label}</div>
    </section>
  );
}
