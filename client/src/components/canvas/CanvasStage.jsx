import { Stage, Layer, Rect, Line, Text, Circle, Ellipse, Arrow, RegularPolygon } from "react-konva";
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

const CanvasStage = ({ 
  shapes,
  setShapes,
  tool,
  strokeColor,
  strokeWidth,
}) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState(null);
  const textInputRef = useRef(null);
  const [drawingShapeId, setDrawingShapeId] = useState(null);
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

    const createDragShape = (type, shapeProps) => {
      const id = crypto.randomUUID();
      setDrawingShapeId(id);
      setShapes((prev) => [...prev, { id, type, ...shapeProps }]);
    };

    /* RECTANGLE */
    if (tool === "rect") {
      createDragShape("rect", {
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        fillEnabled: false,
      });
    }

    /* CIRCLE */
    if (tool === "circle") {
      createDragShape("circle", {
        x: pos.x,
        y: pos.y,
        radius: 0,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        fillEnabled: false,
      });
    }

    /* ELLIPSE */
    if (tool === "ellipse") {
      createDragShape("ellipse", {
        x: pos.x,
        y: pos.y,
        radiusX: 0,
        radiusY: 0,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        fillEnabled: false,
      });
    }

    /* STRAIGHT LINE */
    if (tool === "lineStraight") {
      createDragShape("lineStraight", {
        x: pos.x,
        y: pos.y,
        points: [0, 0, 0, 0],
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });
    }

    /* ARROW */
    if (tool === "arrow") {
      createDragShape("arrow", {
        x: pos.x,
        y: pos.y,
        points: [0, 0, 0, 0],
        pointerLength: 10,
        pointerWidth: 10,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        fill: strokeColor,
      });
    }

    /* TRIANGLE */
    if (tool === "triangle") {
      createDragShape("triangle", {
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        fillEnabled: false,
      });
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
          stroke: strokeColor,
          strokeWidth: strokeWidth,
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

      

      setTextInput({
        screenX: screenX,
        screenY: screenY,
        canvasX: pos.x,
        canvasY: pos.y,
        value: "",
      });
    }

    if (tool === "eraser") {
      eraseAtPoint(pos.x, pos.y);
    }
  };

  /* -------------------------------
     MOUSE MOVE (PEN)
  -------------------------------- */
  const handleMouseMove = () => {
  const stage = stageRef.current;
  if (!stage) return;

  const pos = stage.getPointerPosition();
  if (!pos) return;

  /* PEN TOOL */
  if (isDrawing && tool === "pen") {
    setShapes(prev => {
      const last = prev[prev.length - 1];
      if (!last || last.type !== "line") return prev;

      const updated = {
        ...last,
        points: [...last.points, pos.x, pos.y],
      };

      return [...prev.slice(0, -1), updated];
    });
  }

  /* DRAG RESIZE for rect, circle, ellipse, lineStraight, arrow, triangle */
  if (drawingShapeId) {
    const dragTools = ["rect", "circle", "ellipse", "lineStraight", "arrow", "triangle"];
    if (dragTools.includes(tool)) {
      setShapes(prev =>
        prev.map(shape => {
          if (shape.id !== drawingShapeId) return shape;

          if (shape.type === "rect" || shape.type === "triangle") {
            const newWidth = pos.x - shape.x;
            const newHeight = pos.y - shape.y;
            const x = newWidth >= 0 ? shape.x : pos.x;
            const y = newHeight >= 0 ? shape.y : pos.y;
            const width = Math.abs(newWidth);
            const height = Math.abs(newHeight);
            return { ...shape, x, y, width, height };
          }

          if (shape.type === "circle") {
            const radius = Math.sqrt(
              Math.pow(pos.x - shape.x, 2) + Math.pow(pos.y - shape.y, 2)
            );
            return { ...shape, radius };
          }

          if (shape.type === "ellipse") {
            const radiusX = Math.abs(pos.x - shape.x);
            const radiusY = Math.abs(pos.y - shape.y);
            return { ...shape, radiusX, radiusY };
          }

          if (shape.type === "lineStraight" || shape.type === "arrow") {
            const dx = pos.x - shape.x;
            const dy = pos.y - shape.y;
            return { ...shape, points: [0, 0, dx, dy] };
          }

          return shape;
        })
      );
    }
  }
};


  /* -------------------------------
     MOUSE UP
  -------------------------------- */
  const handleMouseUp = () => {
    setIsDrawing(false);
    setDrawingShapeId(null);
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
          fill: strokeColor,
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

    if (shape.type === "circle") {
      return <Circle key={shape.id} {...shape} />;
    }

    if (shape.type === "ellipse") {
      return <Ellipse key={shape.id} {...shape} />;
    }

    if (shape.type === "lineStraight") {
      return <Line key={shape.id} {...shape} />;
    }

    if (shape.type === "arrow") {
      return <Arrow key={shape.id} {...shape} />;
    }

    if (shape.type === "triangle") {
      const { width = 0, height = 0, ...rest } = shape;
      const w = Math.max(width, 1);
      const h = Math.max(height, 1);
      const radius = Math.min(w, h) / 2;
      return (
        <RegularPolygon
          key={shape.id}
          {...rest}
          x={shape.x + w / 2}
          y={shape.y + h / 2}
          radius={radius}
          sides={3}
        />
      );
    }

    if (shape.type === "line") {
      return <Line key={shape.id} {...shape} />;
    }

    if (shape.type === "text") {
      return <Text key={shape.id} {...shape} />;
    }

    return null;
  };

  const pointToSegmentDist = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 0.001;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
  };

  const hitTestShape = (shape, x, y) => {
    if (shape.type === "line") {
      for (let i = 0; i < shape.points.length; i += 2) {
        const dx = shape.points[i] - x;
        const dy = shape.points[i + 1] - y;
        if (Math.sqrt(dx * dx + dy * dy) < 8) return true;
      }
      return false;
    }
    if (shape.type === "rect" || shape.type === "triangle") {
      const w = shape.width || 0;
      const h = shape.height || 0;
      if (w <= 0 || h <= 0) return false;
      return (
        x >= shape.x &&
        x <= shape.x + w &&
        y >= shape.y &&
        y <= shape.y + h
      );
    }
    if (shape.type === "circle") {
      const r = shape.radius || 0;
      if (r <= 0) return false;
      const dx = x - shape.x;
      const dy = y - shape.y;
      return Math.sqrt(dx * dx + dy * dy) <= r;
    }
    if (shape.type === "ellipse") {
      const rx = Math.max(shape.radiusX || 0, 0.1);
      const ry = Math.max(shape.radiusY || 0, 0.1);
      const dx = (x - shape.x) / rx;
      const dy = (y - shape.y) / ry;
      return dx * dx + dy * dy <= 1;
    }
    if (shape.type === "lineStraight" || shape.type === "arrow") {
      const pts = shape.points || [0, 0, 0, 0];
      const [x1, y1, x2, y2] = [
        shape.x + pts[0],
        shape.y + pts[1],
        shape.x + pts[2],
        shape.y + pts[3],
      ];
      if (x1 === x2 && y1 === y2) return false;
      const dist = pointToSegmentDist(x, y, x1, y1, x2, y2);
      return dist < 8;
    }
    if (shape.type === "text") {
      return (
        x >= shape.x &&
        x <= shape.x + shape.text.length * 12 &&
        y >= shape.y - 20 &&
        y <= shape.y + 5
      );
    }
    return false;
  };

  const eraseAtPoint = (x, y) => {
    setShapes((prev) =>
      prev.filter((shape) => !hitTestShape(shape, x, y))
    );
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
            position : "fixed",
            top : `${textInput.screenY}px`,
            left : `${textInput.screenX}px`,

            background: "transparent",
            border: "none",
            outline :"none",
            padding : "0",
            margin: "0",

            fontSize :"20px",
            fontFamily : "Arial, sans-serif",
            color : strokeColor,

            caretColor : "#000",
            resize:"none",
            overflow: "hidden",
            whiteSpace: "pre",

            minWidth : "1px",
            minHeight : "1em",
            width: `${Math.max(1, textInput.value.length)}ch`,

            zIndex: 99999,
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
