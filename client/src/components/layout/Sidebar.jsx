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
import buddyBoardLogo from '../../images/BuddyBoard.png';
import logoImage from '../../images/logo.png';
import defaultAvatar from '../../images/default-avatar.png';

const Sidebar = ({ user, collections = [], onLogout}) => {
  // user: { name: string, email: string }
  // collections: [ { id: string, name: string } ]
  // onLogout: function to call when logout is clicked

  const [collapsed, setCollapsed] = useState(false);
  const [CollectionsOpen, setCollectionsOpen] = useState(true);


  const navItem = ({ isActive}) => 
    `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} ${collapsed ? 'px-2' : 'px-4'} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? "bg-gradient-to-r from-orange-50 to-orange-50/50 text-orange-600 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`;

  // navItem is a function that returns the className string for NavLink based on whether it is active or not

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shadow-sm ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Top : Logo + collapse button */}
      <div className = {`${collapsed ? 'h-20' : 'h-32'} flex ${collapsed ? 'flex-col items-center justify-center gap-2' : 'items-center justify-between'} border-b border-gray-100 relative bg-gradient-to-br from-white to-gray-50/50`}>
        <div className = {`flex items-center justify-center ${collapsed ? 'flex-1' : 'flex-1'} h-full ${collapsed ? 'px-2' : 'px-4'}`}>
          <img
            src = {collapsed ? logoImage : buddyBoardLogo}
            alt = "BuddyBoard"
            className = {collapsed ? "h-14 w-14 object-contain" : "h-full w-full object-contain"}
          />
        </div>

        <button
          onClick = {() => setCollapsed(!collapsed)}
          className = {`${collapsed ? 'relative' : 'absolute right-3 top-3'} p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors z-10`}
        >
          <FiMenu className="w-4 h-4"/>
        </button>

      </div>

      {/* Navigation Links */}

      <nav className = "flex-1 p-3 space-y-1 overflow-y-auto">
        <NavLink to = "/dashboard" className = {navItem}>
          <FiFileText className={collapsed ? "w-6 h-6" : "w-5 h-5"}/>
          {!collapsed && "All Notes"}
        </NavLink>

        <NavLink to = "/dashboard/owned" className = {navItem}>
          <FiFileText className={collapsed ? "w-6 h-6" : "w-5 h-5"}/>
          {!collapsed && "Owned Notes"}
        </NavLink>

        <NavLink to = "/dashboard/shared" className = {navItem}>
          <FiUsers className={collapsed ? "w-6 h-6" : "w-5 h-5"}/>
          {!collapsed && "Shared Notes"}
        </NavLink>

        {/* Collections Section */}

        <div className = "mt-4">
          <button 
            onClick={()=> setCollectionsOpen(!CollectionsOpen)}
            className = {`flex items-center w-full ${collapsed ? 'justify-center px-2' : 'px-4'} py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200`}
          >
            <FiFolder className={collapsed ? "w-6 h-6" : "w-5 h-5"}/>
            {!collapsed && (
              <>
                <span className = "ml-3 flex-1 text-left">Collections</span>
                <span className = "text-xs text-gray-400">
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
                  <FiFolder className={collapsed ? "w-6 h-6" : "w-5 h-5"}/>
                  {c.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom : User Info + Logout */}

      <div className = "border-t border-gray-100 p-4 bg-gradient-to-t from-gray-50/50 to-transparent">
        <div className = {`flex ${collapsed ? 'flex-col items-center gap-3' : 'items-center gap-3'}`}>
          <img
            src = {user?.photo || defaultAvatar}
            alt = "profile"
            className="h-10 w-10 rounded-full ring-2 ring-gray-200 shadow-sm"
          />

          {!collapsed && (
            <div className='flex-1 min-w-0'>
              <div className='text-sm font-semibold text-gray-900 truncate'>
                {user?.name}
              </div>
              <button
                onClick = {onLogout}
                className = "flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors mt-0.5"
              >
                <FiLogOut className="w-3.5 h-3.5"/>
                Logout
              </button>
            </div>
          )}

          {collapsed && (
            <button
              onClick = {onLogout}
              className = "p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5"/>
            </button>
          )}

        </div>
      </div>

    </aside>
  );
};

export default Sidebar;