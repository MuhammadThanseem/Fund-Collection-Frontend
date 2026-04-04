import { FiBell, FiPlus } from "react-icons/fi";

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div></div>

      <div className="flex items-center gap-4">
        <FiBell className="text-gray-500" />
      </div>
    </header>
  );
}
