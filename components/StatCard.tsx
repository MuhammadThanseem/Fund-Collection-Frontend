export default function StatCard({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change: string;
}) {
  const positive = change.startsWith("+");

  return (
    <div className="bg-white rounded-xl p-6 border">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{title}</p>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            positive
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}