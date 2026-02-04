import {
  FiMousePointer,
  FiSquare,
  FiEdit2,
  FiType,
  FiCircle,
  FiMinus,
  FiArrowRight,
  FiTriangle,
} from "react-icons/fi";
import { BsEraser } from "react-icons/bs";

import ToolButton from "./ToolButton";

const Toolbar = ({ toolState, setToolState }) => {
  const {tool, strokeColor, strokeWidth} = toolState;

  return (
    <div
      className="
        flex items-center justify-center gap-3 px-4 py-3 border-b bg-white shadow-sm rounded-lg
      "
    >
      {/* TOOLS */}
      <ToolButton
        icon={<FiMousePointer/>}
        label="Select"
        active={tool === "select"}
        onClick={() => setToolState(s => ({...s, tool : "select"}))}
      />

      <ToolButton
        icon={<FiEdit2 />}
        label="Pen"
        active={tool === "pen"}
        onClick={() => setToolState(s => ({...s, tool : "pen"}))}
      />

      <ToolButton
        icon={<FiSquare />}
        label="Rectangle"
        active={tool === "rect"}
        onClick={() => setToolState((s) => ({ ...s, tool: "rect" }))}
      />
      <ToolButton
        icon={<FiCircle />}
        label="Circle"
        active={tool === "circle"}
        onClick={() => setToolState((s) => ({ ...s, tool: "circle" }))}
      />
      <ToolButton
        icon={<FiCircle />}
        label="Ellipse"
        active={tool === "ellipse"}
        onClick={() => setToolState((s) => ({ ...s, tool: "ellipse" }))}
      />
      <ToolButton
        icon={<FiMinus />}
        label="Line"
        active={tool === "lineStraight"}
        onClick={() => setToolState((s) => ({ ...s, tool: "lineStraight" }))}
      />
      <ToolButton
        icon={<FiArrowRight />}
        label="Arrow"
        active={tool === "arrow"}
        onClick={() => setToolState((s) => ({ ...s, tool: "arrow" }))}
      />
      <ToolButton
        icon={<FiTriangle />}
        label="Triangle"
        active={tool === "triangle"}
        onClick={() => setToolState((s) => ({ ...s, tool: "triangle" }))}
      />
      <ToolButton
        icon={<FiType />}
        label="Text"
        active={tool === "text"}
        onClick={() => setToolState(s => ({...s, tool : "text"}))}
      />

      <ToolButton
        icon={<BsEraser/>}
        label="Eraser"
        active={tool === "eraser"}
        onClick={() => setToolState(s => ({...s, tool : "eraser"}))}
      />

      <div className="w-px h-6 bg-gray-200 mx-2" />

      {/* Color Picker */}
      <input
        type = "color"
        value = {strokeColor}
        onChange = {(e) => 
          setToolState(s => ({...s, strokeColor : e.target.value}))
        }
        className="w-8 h-8 cursor-pointer"
      >
      </input>

      {/* Stroke width */}
      <input
        type = "range"
        min = {1}
        max = {10}
        value = {strokeWidth}
        onChange = {(e) => 
          setToolState(s => ({...s, strokeWidth :Number(e.target.value)}))
        }
      />
    </div>
  );
};

export default Toolbar;
