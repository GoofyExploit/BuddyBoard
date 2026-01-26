const Sidebar = ({ collections }) => {
  return (
    <div className="w-64 border-r p-4">
      <h2 className="font-semibold mb-4">Collections</h2>
      <ul className="space-y-2">
        {collections.map(col => (
          <li key={col._id} className="text-sm text-gray-700">
            {col.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
