import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Admin</h1>
        <nav>
          <ul>
            <li>
              <NavLink
                to="/admin/projects"
                className={({ isActive }) =>
                  `block py-2 px-4 rounded ${isActive ? 'bg-gray-700' : ''}`
                }
              >
                Projects
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/certificates"
                className={({ isActive }) =>
                  `block py-2 px-4 rounded ${isActive ? 'bg-gray-700' : ''}`
                }
              >
                Certificates
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
