import { Stage, Layer, Rect, Line, Text } from "react-konva";
import { useRef, useState, useEffect } from "react";

/*
  shapes = [
    { id, type: "rect", x, y, width, height, fill },
    { id, type: "line", points: [], stroke, strokeWidth },
    { id, type: "text", x, y, text, fontSize, fill }
  ]
*/

/*
* useRef is a React hook that creates a mutable object persisting for the full lifetime of a component, 
    allowing you to store data or access DOM elements directly without triggering re-renders when the value changes. 
    It returns a plain JavaScript object with a single current property, which can be updated synchronously. 
*/

const CanvasStage = ({ shapes, setShapes, tool }) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState(null);
  const textInputRef = useRef(null);
  // textInputRef is used to focus the textarea when it's created 
  const isTextInputNewRef = useRef(false);
  /*
    textInput = {
      screenX,
      screenY,
      canvasX,
      canvasY,
      value
    }
  */


  // Focus the textarea when it's created
  useEffect(() => {
    if (textInput && textInputRef.current) {
      isTextInputNewRef.current = true;
      // Small delay to ensure the textarea is fully rendered
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
          // Reset the flag after a short delay
          setTimeout(() => {
            isTextInputNewRef.current = false;
          }, 100);
        }
      }, 10);
    }
  }, [textInput]);

  /* -------------------------------
     MOUSE DOWN
  -------------------------------- */
  const handleMouseDown = (e) => {
    console.log("handleMouseDown called, tool:", tool, "textInput:", textInput);
    
    // Don't handle mouse events if text input is active
    if (textInput) {
      console.log("TextInput already active, returning");
      return;
    }

    const stage = stageRef.current;
    if (!stage) {
      console.log("Stage ref is null");
      return;
    }

    const pos = stage.getPointerPosition();
    console.log("Pointer position:", pos);

    if (!pos) {
      console.log("No pointer position");
      return;
    }

    /* RECTANGLE */
    if (tool === "rect") {
      setShapes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "rect",
          x: pos.x,
          y: pos.y,
          width: 120,
          height: 80,
          fill: "#000",
        },
      ]);
    }

    /* PEN */
    if (tool === "pen") {
      setIsDrawing(true);
      setShapes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "line",
          points: [pos.x, pos.y],
          stroke: "#000",
          strokeWidth: 2,
          tension: 0.5,
          lineCap: "round",
          lineJoin: "round",
        },
      ]);
    }

    /* TEXT */
    if (tool === "text") {
      const rect = stage.container().getBoundingClientRect();
      const screenX = rect.left + pos.x;
      const screenY = rect.top + pos.y;

      console.log("Setting textInput:", { screenX, screenY, canvasX: pos.x, canvasY: pos.y });
      console.log("Stage rect:", rect);
      console.log("Pointer position:", pos);

      setTextInput({
        screenX: screenX,
        screenY: screenY,
        canvasX: pos.x,
        canvasY: pos.y,
        value: "",
      });
    }
  };

  /* -------------------------------
     MOUSE MOVE (PEN)
  -------------------------------- */
  const handleMouseMove = () => {
    if (!isDrawing || tool !== "pen") return;

    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    setShapes((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.type !== "line") return prev;

      const updated = {
        ...last,
        points: [...last.points, pos.x, pos.y],
      };

      return [...prev.slice(0, -1), updated];
    });
  };

  /* -------------------------------
     MOUSE UP
  -------------------------------- */
  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  /* -------------------------------
     COMMIT TEXT INPUT
  -------------------------------- */
  const commitText = () => {
    // Prevent immediate blur when textarea is just created
    if (isTextInputNewRef.current) {
      console.log("Ignoring blur - textarea just created");
      return;
    }

    setTextInput((current) => {
      if (!current || !current.value.trim()) {
        console.log("Committing text - empty value, clearing");
        return null;
      }

      console.log("Committing text - adding shape:", current.value);
      setShapes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "text",
          x: current.canvasX,
          y: current.canvasY,
          text: current.value,
          fontSize: 20,
          fill: "#000",
        },
      ]);

      return null;
    });
  };

  /* -------------------------------
     RENDER SHAPES
  -------------------------------- */
  const renderShape = (shape) => {
    if (shape.type === "rect") {
      return <Rect key={shape.id} {...shape} />;
    }

    if (shape.type === "line") {
      return <Line key={shape.id} {...shape} />;
    }

    if (shape.type === "text") {
      return <Text key={shape.id} {...shape} />;
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#fff",
      }}
    >
      {/* ----------- CANVAS ----------- */}
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>{shapes.map(renderShape)}</Layer>
      </Stage>

      {/* ----------- TEXT INPUT (DOM) ----------- */}
      {textInput && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 99998,
            pointerEvents: "none",
          }}
        >
          <textarea
          ref={textInputRef}
          autoFocus
          style={{
            position: "fixed",
            top: `${textInput.screenY}px`,
            left: `${textInput.screenX}px`,
            fontSize: "20px",
            padding: "8px",
            border: "2px solid #000",
            borderRadius: "4px",
            outline: "none",
            resize: "none",
            background: "#fff",
            color: "#000",
            zIndex: 99999,
            whiteSpace: "pre",
            minWidth: "150px",
            minHeight: "30px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            fontFamily: "Arial, sans-serif",
            pointerEvents: "auto",
          }}
          value={textInput.value}
          onChange={(e) =>
            setTextInput((prev) => ({ ...prev, value: e.target.value }))
          }
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commitText();
            }
            // Stop propagation to prevent Stage from handling the event
            e.stopPropagation();
          }}
          onClick={(e) => {
            // Stop propagation to prevent Stage from handling the event
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            // Stop propagation to prevent Stage from handling the event
            e.stopPropagation();
          }}
        />
        </div>
      )}
    </div>
  );
};

export default CanvasStage;
