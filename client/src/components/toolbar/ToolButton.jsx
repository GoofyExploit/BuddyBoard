const ToolButton = ({icon, label, active, onClick }) => {
  return (
    <button
      onClick = {onClick}
      title = {label}
      className = {
        `flex items-center justify-center
        w-10 h-10 rounded-lg
        transition-all
        ${
          active
            ? "bg-black text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }
        border`
      }
    >
      {icon}
    </button>
  )
};

export default ToolButton;
