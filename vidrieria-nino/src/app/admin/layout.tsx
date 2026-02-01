
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <aside className="w-64 bg-primary text-white p-4">
        <h2 className="text-xl font-bold mb-4">Admin</h2>
        <nav>
          <ul>
            <li><a href="/admin" className="block py-2">Dashboard</a></li>
            {/* Add more admin links here */}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
