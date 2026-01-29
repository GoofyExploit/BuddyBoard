import {
  FiMousePointer,
  FiSquare,
  FiCircle,
  FiEdit3,
  FiType,
  FiDelete,
} from "react-icons/fi";
import ToolButton from "./ToolButton";

const Toolbar = ({ toolState, setToolState }) => {
  const setTool = (tool) =>
    setToolState((prev) => ({ ...prev, tool }));

  return (
    <div
      className="
        fixed left-4 top-1/2 -translate-y-1/2
        bg-white shadow-xl rounded-2xl
        p-3 space-y-3 z-50
      "
    >
      {/* TOOLS */}
      <ToolButton
        icon={<FiMousePointer size={18} />}
        title="Select"
        active={toolState.tool === "select"}
        onClick={() => setTool("select")}
      />

      <ToolButton
        icon={<FiSquare size={18} />}
        title="Rectangle"
        active={toolState.tool === "rect"}
        onClick={() => setTool("rect")}
      />

      <ToolButton
        icon={<FiCircle size={18} />}
        title="Ellipse"
        active={toolState.tool === "ellipse"}
        onClick={() => setTool("ellipse")}
      />

      <ToolButton
        icon={<FiEdit3 size={18} />}
        title="Pen"
        active={toolState.tool === "pen"}
        onClick={() => setTool("pen")}
      />

      <ToolButton
        icon={<FiType size={18} />}
        title="Text"
        active={toolState.tool === "text"}
        onClick={() => setTool("text")}
      />

      <ToolButton
        icon={<FiDelete size={18} />}
        title="Eraser"
        active={toolState.tool === "eraser"}
        onClick={() => setTool("eraser")}
      />

      <div className="h-px bg-gray-200 my-2" />

      {/* STROKE COLOR */}
      <div className="flex flex-col items-center gap-1">
        <input
          type="color"
          value={toolState.strokeColor}
          onChange={(e) =>
            setToolState((prev) => ({
              ...prev,
              strokeColor: e.target.value,
            }))
          }
          className="w-8 h-8 cursor-pointer border-none"
        />
        <span className="text-[10px] text-gray-500">Stroke</span>
      </div>

      {/* FILL COLOR */}
      <div className="flex flex-col items-center gap-1">
        <input
          type="color"
          value={toolState.fillColor}
          onChange={(e) =>
            setToolState((prev) => ({
              ...prev,
              fillColor: e.target.value,
            }))
          }
          className="w-8 h-8 cursor-pointer border-none"
        />
        <span className="text-[10px] text-gray-500">Fill</span>
      </div>

      {/* STROKE WIDTH */}
      <div className="flex flex-col items-center gap-1">
        <input
          type="range"
          min={1}
          max={10}
          value={toolState.strokeWidth}
          onChange={(e) =>
            setToolState((prev) => ({
              ...prev,
              strokeWidth: Number(e.target.value),
            }))
          }
          className="w-20"
        />
        <span className="text-[10px] text-gray-500">
          Width: {toolState.strokeWidth}
        </span>
      </div>
    </div>
  );
};

export default Toolbar;
