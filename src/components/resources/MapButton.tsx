type Props = {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  resourceName: string;
};

export function MapButton({ address, latitude, longitude, resourceName }: Props) {
  const query =
    latitude != null && longitude != null
      ? `${latitude},${longitude}`
      : address;
  if (!query) return null;

  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`開啟地圖導航至 ${resourceName}`}
      className="inline-flex w-full items-center justify-center gap-3 rounded-2xl py-6 text-2xl font-bold shadow-md transition active:scale-95"
      style={{ background: "#1D4ED8", color: "#FFFFFF" }}
    >
      📍&nbsp;開啟地圖
    </a>
  );
}
