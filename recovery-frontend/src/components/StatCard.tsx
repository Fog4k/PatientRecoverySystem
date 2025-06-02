export default function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className={`bg-${color}-100 text-${color}-800 p-6 rounded-xl shadow-sm`}>
      <div className="text-sm font-medium mb-1">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}