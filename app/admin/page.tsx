import CollectionChart from "@/components/CollectionChart";
import StatCard from "@/components/StatCard";


export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Collected" value="$45,280.00" change="+12.5%" />
        <StatCard title="Active Boxes" value="124" change="-2.4%" />
        <StatCard title="Recent Collections" value="85" change="+5.0%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CollectionChart />
        </div>

      </div>


    </div>
  );
}