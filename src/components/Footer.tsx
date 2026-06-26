import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-400 text-center">
        <span>© {new Date().getFullYear()} OrderLink</span>
      </div>
    </footer>
  );
}
