'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiBarChart2, FiUsers, FiDollarSign, FiBookOpen, FiGrid, FiHome } from 'react-icons/fi';

const sidebarItems = [
  { label: 'Overview', href: '/dashboard/admin', icon: FiHome },
  { label: 'Students', href: '/dashboard/admin/students', icon: FiUsers },
  { label: 'Revenue', href: '/dashboard/admin/revenue', icon: FiDollarSign },
  { label: 'Courses', href: '/dashboard/admin/courses', icon: FiBookOpen },
  { label: 'Instructors', href: '/dashboard/admin/instructors', icon: FiBarChart2 },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white shrink-0 hidden lg:block" style={{ borderRight: '1px solid #EEF0F6' }}>
          <div className="p-5" style={{ borderBottom: '1px solid #EEF0F6' }}>
            <h4 className="text-base font-bold heading-font flex items-center gap-2" style={{ color: '#260944' }}>
              <FiGrid size={18} style={{ color: '#757FEF' }} /> Admin Panel
            </h4>
          </div>
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all"
                  style={{
                    backgroundColor: isActive ? 'rgba(117, 127, 239, 0.08)' : 'transparent',
                    color: isActive ? '#757FEF' : '#5B5B98',
                  }}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
