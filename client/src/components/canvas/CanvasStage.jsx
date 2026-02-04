import {
  Stage,
  Layer,
  Rect,
  Line,
  Text,
  Circle,
  Ellipse,
  Arrow,
  RegularPolygon,
} from "react-konva";
import { useRef, useState, useEffect } from "react";

const CanvasStage = ({
  shapes,
  setShapes,
  tool,
  strokeColor,
  strokeWidth,
  eraserSize,
}) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingShapeId, setDrawingShapeId] = useState(null);

  const [textInput, setTextInput] = useState(null);
  const textInputRef = useRef(null);
  const isTextInputNewRef = useRef(false);

  /* ---------------------------------
     Focus textarea when created
  ---------------------------------- */
  useEffect(() => {
    if (textInput && textInputRef.current) {
      isTextInputNewRef.current = true;
      setTimeout(() => {
        textInputRef.current?.focus();
        setTimeout(() => {
          isTextInputNewRef.current = false;
        }, 100);
      }, 10);
    }
  }, [textInput]);

  /* ---------------------------------
     Pointer Down
  ---------------------------------- */
  const handlePointerDown = () => {
    if (textInput) return;

    const stage = stageRef.current;
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    const createShape = (type, props) => {
      const id = crypto.randomUUID();
      setDrawingShapeId(id);
      setShapes(prev => [...prev, { id, type, ...props }]);
    };

    if (tool === "rect") {
      createShape("rect", {
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        stroke: strokeColor,
        strokeWidth,
      });
    }

    if (tool === "circle") {
      createShape("circle", {
        x: pos.x,
        y: pos.y,
        radius: 0,
        stroke: strokeColor,
        strokeWidth,
      });
    }

    if (tool === "ellipse") {
      createShape("ellipse", {
        x: pos.x,
        y: pos.y,
        radiusX: 0,
        radiusY: 0,
        stroke: strokeColor,
        strokeWidth,
      });
    }

    if (tool === "triangle") {
      createShape("triangle", {
        x: pos.x,
        y: pos.y,
        radius: 0,
        stroke: strokeColor,
        strokeWidth,
      });
    }

    if (tool === "lineStraight" || tool === "arrow") {
      createShape(tool, {
        x: pos.x,
        y: pos.y,
        points: [0, 0, 0, 0],
        stroke: strokeColor,
        strokeWidth,
        fill: tool === "arrow" ? strokeColor : undefined,
      });
    }

    if (tool === "pen") {
      setIsDrawing(true);
      setShapes(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "line",
          points: [pos.x, pos.y],
          stroke: strokeColor,
          strokeWidth,
          lineCap: "round",
          lineJoin: "round",
        },
      ]);
    }

    if (tool === "eraser") {
      setIsDrawing(true);
      eraseAtPoint(pos.x, pos.y);
    }

    if (tool === "text") {
      const rect = stage.container().getBoundingClientRect();
      setTextInput({
        screenX: rect.left + pos.x,
        screenY: rect.top + pos.y,
        canvasX: pos.x,
        canvasY: pos.y,
        value: "",
        fontSize: 20,
      });
    }
  };

  /* ---------------------------------
     Pointer Move
  ---------------------------------- */
  const handlePointerMove = () => {
    const stage = stageRef.current;
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    if (isDrawing && tool === "eraser") {
      eraseAtPoint(pos.x, pos.y);
      return;
    }

    if (isDrawing && tool === "pen") {
      setShapes(prev => {
        const last = prev[prev.length - 1];
        if (!last || last.type !== "line") return prev;

        return [
          ...prev.slice(0, -1),
          { ...last, points: [...last.points, pos.x, pos.y] },
        ];
      });
    }

    if (drawingShapeId) {
      setShapes(prev =>
        prev.map(shape => {
          if (shape.id !== drawingShapeId) return shape;

          if (shape.type === "rect") {
            const w = pos.x - shape.x;
            const h = pos.y - shape.y;
            return {
              ...shape,
              x: w < 0 ? pos.x : shape.x,
              y: h < 0 ? pos.y : shape.y,
              width: Math.abs(w),
              height: Math.abs(h),
            };
          }

          if (shape.type === "triangle") {
            return {
              ...shape,
              radius: Math.min(Math.abs(pos.x - shape.x), Math.abs(pos.y - shape.y)),
            };
          }

          if (shape.type === "circle") {
            return {
              ...shape,
              radius: Math.hypot(pos.x - shape.x, pos.y - shape.y),
            };
          }

          if (shape.type === "ellipse") {
            return {
              ...shape,
              radiusX: Math.abs(pos.x - shape.x),
              radiusY: Math.abs(pos.y - shape.y),
            };
          }

          if (shape.type === "lineStraight" || shape.type === "arrow") {
            return {
              ...shape,
              points: [0, 0, pos.x - shape.x, pos.y - shape.y],
            };
          }

          return shape;
        })
      );
    }
  };

  /* ---------------------------------
     Pointer Up
  ---------------------------------- */
  const handlePointerUp = () => {
    setIsDrawing(false);
    setDrawingShapeId(null);
  };

  /* ---------------------------------
     Text Commit
  ---------------------------------- */
  const commitText = () => {
    if (isTextInputNewRef.current) return;

    setShapes(prev => {
      if (!textInput.value.trim()) {
        return textInput.editId
          ? prev.filter(s => s.id !== textInput.editId)
          : prev;
      }

      if (textInput.editId) {
        return prev.map(s =>
          s.id === textInput.editId ? { ...s, text: textInput.value } : s
        );
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "text",
          x: textInput.canvasX,
          y: textInput.canvasY,
          text: textInput.value,
          fontSize: textInput.fontSize,
          fill: strokeColor,
        },
      ];
    });

    setTextInput(null);
  };

  /* ---------------------------------
     Eraser
  ---------------------------------- */

  const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

  const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return dist(px, py, x1, y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)));
    const projx = x1 + t * dx, projy = y1 + t * dy;
    return dist(px, py, projx, projy);
  };

  const isPointNearLine = (x, y, line, radius) => {
    if (line.type === "lineStraight" || line.type === "arrow") {
      const dx = line.points[2], dy = line.points[3];
      const len = Math.hypot(dx, dy);
      if (len === 0) return dist(x, y, line.x, line.y) <= radius;
      const t = Math.max(0, Math.min(1, ((x - line.x) * dx + (y - line.y) * dy) / (len * len)));
      const projx = line.x + t * dx, projy = line.y + t * dy;
      return dist(x, y, projx, projy) <= radius;
    }
    // For pen lines, check each segment
    const points = line.points;
    for (let i = 0; i < points.length - 2; i += 2) {
      if (pointToLineDistance(x, y, points[i], points[i+1], points[i+2], points[i+3]) <= radius) return true;
    }
    return false;
  };

  const isPointInRect = (x, y, rect) => x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;

  const isPointInCircle = (x, y, circle) => dist(x, y, circle.x, circle.y) <= circle.radius;

  const isPointInEllipse = (x, y, ellipse) => ((x - ellipse.x) / ellipse.radiusX) ** 2 + ((y - ellipse.y) / ellipse.radiusY) ** 2 <= 1;

  const isPointInTriangle = (x, y, triangle) => dist(x, y, triangle.x, triangle.y) <= triangle.radius; // Approximate with circle

  const eraseLineSmoothly = (line, x, y, radius) => {
    const points = line.points;
    const segments = [];
    let currentSegment = [];

    for (let i = 0; i < points.length; i += 2) {
      const px = points[i];
      const py = points[i + 1];

      if (dist(px, py, x, y) > radius) {
        currentSegment.push(px, py);
      } else {
        if (currentSegment.length >= 4) {
          segments.push({ ...line, points: [...currentSegment] });
        }
        currentSegment = [];
      }
    }

    if (currentSegment.length >= 4) {
      segments.push({ ...line, points: currentSegment });
    }

    return segments;
  };

  const eraseAtPoint = (x, y) => {
    setShapes(prev =>
      prev.flatMap(shape => {
        if (shape.type === "text") return [shape];

        if (shape.type === "line") {
          return eraseLineSmoothly(shape, x, y, eraserSize);
        }

        if (shape.type === "rect" && isPointInRect(x, y, shape)) return [];
        if (shape.type === "circle" && isPointInCircle(x, y, shape)) return [];
        if (shape.type === "ellipse" && isPointInEllipse(x, y, shape)) return [];
        if (shape.type === "triangle" && isPointInTriangle(x, y, shape)) return [];
        if ((shape.type === "lineStraight" || shape.type === "arrow") && isPointNearLine(x, y, shape, eraserSize)) return [];

        return [shape];
      })
    );
  };

  /* ---------------------------------
     Render Shapes
  ---------------------------------- */
  const renderShape = shape => {
    if (shape.type === "rect") return <Rect key={shape.id} {...shape} />;
    if (shape.type === "circle") return <Circle key={shape.id} {...shape} />;
    if (shape.type === "ellipse") return <Ellipse key={shape.id} {...shape} />;
    if (shape.type === "line") return <Line key={shape.id} {...shape} />;
    if (shape.type === "lineStraight") return <Line key={shape.id} {...shape} />;
    if (shape.type === "arrow") return <Arrow key={shape.id} {...shape} />;

    if (shape.type === "triangle") {
      return (
        <RegularPolygon
          key={shape.id}
          x={shape.x}
          y={shape.y}
          sides={3}
          radius={shape.radius}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      );
    }

    if (shape.type === "text") {
      if (shape.id === textInput?.editId) return null;
      return (
        <Text
          key={shape.id}
          {...shape}
          onDblClick={() => {
            const rect = stageRef.current
              .container()
              .getBoundingClientRect();
            setTextInput({
              screenX: rect.left + shape.x,
              screenY: rect.top + shape.y,
              canvasX: shape.x,
              canvasY: shape.y,
              value: shape.text,
              editId: shape.id,
              fontSize: shape.fontSize,
            });
          }}
        />
      );
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
        touchAction: "none",
      }}
    >
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Layer>{shapes.map(renderShape)}</Layer>
      </Stage>

      {textInput && (
        <textarea
          ref={textInputRef}
          spellCheck={false}
          style={{
            position: "fixed",
            top: textInput.screenY,
            left: textInput.screenX,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: textInput.fontSize,
            color: strokeColor,
            caretColor: strokeColor,
            resize: "none",
          }}
          value={textInput.value}
          onChange={e =>
            setTextInput(prev => ({ ...prev, value: e.target.value }))
          }
          onBlur={commitText}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commitText();
            }
          }}
        />
      )}
    </div>
  );
};

export default CanvasStage;
