import React from "react";
import Link from "next/link";

const Navigation = () => {
  return (
    <nav className="flex justify-between items-center p-4">
      <div className="flex items-center">
        <Link href="/" className="inline-flex items-center">
          <span className="text-lg font-bold text-brand-dark">
            <span>If</span>
            <span className="hidden group-hover:inline">use</span>
            <span className="text-brand-dark/30">.</span>
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
