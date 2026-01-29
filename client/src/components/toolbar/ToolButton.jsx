const ToolButton = ({ icon, active, onClick, title }) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        w-10 h-10 flex items-center justify-center rounded-lg
        transition-all duration-150
        ${
          active
            ? "bg-black text-white shadow-md"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }
      `}
    >
      {icon}
    </button>
  );
};

export default ToolButton;
