export default function Relocation() {
  return (
    <iframe
      src={`${import.meta.env.BASE_URL}relocation-tracker.html`}
      title="Relocation Planner"
      className="w-full h-full border-0"
    />
  );
}
