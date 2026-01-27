import {useState} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// NavLink is used to apply active styles to the link when the route matches
import {
  FiMenu,
  FiFileText,
  FiUsers,
  FiFolder,
  FiLogOut,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
} from 'react-icons/fi';
import buddyBoardLogo from '../../images/BuddyBoard.png';
import logoImage from '../../images/logo.png';
import defaultAvatar from '../../images/default-avatar.png';
import { updateCollection, deleteCollection } from '../../api/collection.api';

const Sidebar = ({ 
  user,
  collections = [],
  sharedOwners = [],
  selectedSharedUser,
  onSelectSharedUser,
  onLogout,
  onCollectionUpdate
}) => {
  // user: { name: string, email: string }
  // collections: [ { id: string, name: string } ]
  // onLogout: function to call when logout is clicked
  // onCollectionUpdate: function to call when collections are updated

  const [collapsed, setCollapsed] = useState(false);
  const [CollectionsOpen, setCollectionsOpen] = useState(true);
  const [sharedOpen, setSharedOpen] = useState(true);

  const [editingCollection, setEditingCollection] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [hoveredCollection, setHoveredCollection] = useState(null);
  const navigate = useNavigate();


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
        <NavLink to = "/dashboard" end className = {navItem}>
          <FiFileText className={collapsed ? "w-6 h-6" : "w-5 h-5"}/>
          {!collapsed && "All Notes"}
        </NavLink>

        <NavLink to = "/dashboard/owned" className = {navItem}>
          <FiFileText className={collapsed ? "w-6 h-6" : "w-5 h-5"}/>
          {!collapsed && "Owned Notes"}
        </NavLink>

        {/* Shared Notes Section */}
        <div className="mt-1">
          <button
            onClick={() => setSharedOpen(!sharedOpen)}
            className={`flex items-center w-full ${
              collapsed ? "justify-center px-2" : "px-4"
            } py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg`}
          >
            <FiUsers className={collapsed ? "w-6 h-6" : "w-5 h-5"} />
            {!collapsed && (
              <>
                <span className="ml-3 flex-1 text-left">Shared Notes</span>
                <span className="text-xs text-gray-400">
                  {sharedOpen ? "▾" : "▸"}
                </span>
              </>
            )}
          </button>

          {/* Dropdown */}
          {sharedOpen && !collapsed && (
            <div className="ml-8 mt-1 space-y-1">
              {/* All shared */}
              <button
                onClick={() => {
                  onSelectSharedUser(null);
                  navigate("/dashboard/shared");
                }}
                className={`block w-full text-left text-sm px-3 py-1.5 rounded ${
                  selectedSharedUser === null
                    ? "bg-orange-50 text-orange-600 font-medium"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                All
              </button>

              {/* By collaborator */}
              {sharedOwners.map((u) => (
                <button
                  key={u._id}
                  onClick={() => {
                    onSelectSharedUser(u._id);
                    navigate("/dashboard/shared");
                  }}
                  className={`block w-full text-left text-sm px-3 py-1.5 rounded ${
                    selectedSharedUser === u._id
                      ? "bg-orange-50 text-orange-600 font-medium"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {u.name}
                </button>
              ))}
            </div>
          )}
        </div>


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

              {collections.map((c) => {
                const collectionId = c.id || c._id;
                const isEditing = editingCollection === collectionId;
                
                return (
                  <div
                    key={collectionId}
                    className="group relative"
                    onMouseEnter={() => setHoveredCollection(collectionId)}
                    onMouseLeave={() => setHoveredCollection(null)}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 px-3 py-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              try {
                                await updateCollection(collectionId, editingName);
                                onCollectionUpdate?.();
                                setEditingCollection(null);
                              } catch (error) {
                                console.error("Rename error:", error);
                              }
                            } else if (e.key === 'Escape') {
                              setEditingCollection(null);
                            }
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <NavLink
                        to={`/collection/${collectionId}`}
                        className={navItem}
                      >
                        <FiFolder className={collapsed ? "w-6 h-6" : "w-5 h-5"}/>
                        <span className="flex-1">{c.name}</span>
                        {!collapsed && hoveredCollection === collectionId && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setEditingCollection(collectionId);
                                setEditingName(c.name);
                              }}
                              className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                              title="Rename"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setShowDeleteConfirm(collectionId);
                              }}
                              className="p-1 rounded hover:bg-red-100 text-gray-600 hover:text-red-600"
                              title="Delete"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </NavLink>
                    )}
                  </div>
                );
              })}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Collection?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this collection? Notes in this collection will not be deleted, but they will be removed from the collection.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteCollection(showDeleteConfirm);
                    onCollectionUpdate?.();
                    setShowDeleteConfirm(null);
                    navigate("/dashboard");
                  } catch (error) {
                    console.error("Delete error:", error);
                  }
                }}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
};

export default Sidebar;