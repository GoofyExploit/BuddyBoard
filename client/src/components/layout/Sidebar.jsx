import {useState} from 'react';
import { NavLink } from 'react-router-dom';
// NavLink is used to apply active styles to the link when the route matches
import {
  FiMenu,
  FiFileText,
  FiUsers,
  FiFolder,
  FiLogOut,
} from 'react-icons/fi';
import logoImage from '../../images/logo.png';
import defaultAvatar from '../../images/default-avatar.png';

const Sidebar = ({ user, collections = [], onLogout}) => {
  // user: { name: string, email: string }
  // collections: [ { id: string, name: string } ]
  // onLogout: function to call when logout is clicked

  const [collapsed, setCollapsed] = useState(false);
  const [CollectionsOpen, setCollectionsOpen] = useState(true);


  const navItem = ({ isActive}) => 
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${isActive ? "bg-gray-100 text-black" : "text-gray-600 hover:bg-gray-50"}`;

  // navItem is a function that returns the className string for NavLink based on whether it is active or not

  return (
    <aside
      className={`h-screen bg-white border-r flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Top : Logo + collapse button */}
      <div className = "h-16 flex items-center justify-between px-3 border-b">
        <div className = "flex items-center gap-2">
          <img
            src = {logoImage}
            alt = "BuddyBoard"
            className = "h-7 w-7"
          />
          {!collapsed && (
            <span className = "font-semibold text-lg">BuddyBoard</span>
          )}

        </div>

        <button
          onClick = {() => setCollapsed(!collapsed)}
          className = "p-1 rounded hover:bg-gray-100"
        >
          <FiMenu/>
        </button>

      </div>

      {/* Navigation Links */}

      <nav className = "flex-1 p-2 space-y-1 overflow-y-auto">
        <NavLink to = "/dashboard" className = {navItem}>
          <FiFileText/>
          {!collapsed && "All Notes"}
        </NavLink>

        <NavLink to = "/dashboard/owned" className = {navItem}>
          <FiFileText/>
          {!collapsed && "Owned Notes"}
        </NavLink>

        <NavLink to = "/dashboard/shared" className = {navItem}>
          <FiUsers/>
          {!collapsed && "Shared Notes"}
        </NavLink>

        {/* Collections Section */}

        <div className = "mt-3">
          <button 
            onClick={()=> setCollectionsOpen(!CollectionsOpen)}
            className = "flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded"
          >
            <FiFolder/>
            {!collapsed && (
              <>
                <span className = "ml-3 flex-1 text-left">Collections</span>
                <span className = "text-xs">
                  {CollectionsOpen ? '▾' : '▸'}
                </span>
              </>
            )}
          </button>

          {CollectionsOpen && !collapsed && (
            <div className = "ml-8 mt-1 space-y-1">
              {collections.length === 0 && (
                <div className = "text-xs text-gray-400">No Collections</div>
              )}

              {collections.map((c) => (
                <NavLink
                  key = {c.id}
                  to = {`/collection/${c.id}`}
                  className = {navItem}
                >
                  <FiFolder/>
                  {c.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom : User Info + Logout */}

      <div className = "border-t p-3">
        <div className = "flex items-center gap-3">
          <img
            src = {user?.photo || defaultAvatar}
            alt = "profile"
            className='h-8 w-8 rounded-full'
          />

          {!collapsed && (
            <div className='flex-1'>
              <div className='text-sm font-medium'>
                {user?.name}
              </div>
              <button
                onClick = {onLogout}
                className = "flex items-center gap-1 text-xs text-red-500 hover:underline"
              >
                <FiLogOut/>
                Logout
              </button>
            </div>
          )}

        </div>
      </div>

    </aside>
  );
};

export default Sidebar;