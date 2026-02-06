import {
  Stage,
  Layer,
} from "react-konva";
import { useRef, useState, useEffect } from "react";
import renderShape from "./renderShape";

const CanvasStage = ({
  shapes,
  setShapes,
  commitShapes,
  tool,
  strokeColor,
  strokeWidth,
  eraserSize,
}) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingShapeId, setDrawingShapeId] = useState(null);
  const shapesBeforeEraseRef = useRef(null);

  const [textInput, setTextInput] = useState(null);
  const textInputRef = useRef(null);
  const isTextInputNewRef = useRef(false);

  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Smooth eraser: batch updates to 1/frame
  const eraserRafRef = useRef(0);
  const pendingEraseRef = useRef(null); // { x, y } in world coords

  /**
   * infinite area + zoom -> moving the camera positioning shapes live in world space 
  */

  const [camera, setCamera] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });

  const isPanningRef = useRef(false);
  const lastPanPos = useRef({ x: 0, y: 0 });
  const touchStartPos = useRef(null);
  const touchStartTime = useRef(0);
  const isTouchDevice = useRef(false);
  const touchesRef = useRef([]); // Track multiple touches for two-finger pan

  const getWorldPos = () => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    return {
      x: (pointer.x - camera.x) / camera.scale,
      y: (pointer.y - camera.y) / camera.scale,
    };
  };




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

  const getTouchCenter = (t1, t2) => ({
    x: ((t1.clientX || t1.x) + (t2.clientX || t2.x)) / 2,
    y: ((t1.clientY || t1.y) + (t2.clientY || t2.y)) / 2,
  });



  const hitTest = (shape, x, y) => {
    if (shape.type === "rect") {
      return (
        x >= shape.x && 
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      );
    }

    if (shape.type === "circle") {
      return Math.hypot(x - shape.x, y - shape.y) <= shape.radius;
      // calculate the distance d from the center to the point using the Pythagorean theorem: d=sqrt{(x-h)^2+(y-k)^2}. If d <= r, the point is inside or on the boundary

    }

    if (shape.type === "ellipse") {
      const dx = (x - shape.x) / shape.radiusX;
      const dy = (y - shape.y) / shape.radiusY;

      return dx * dx + dy * dy <= 1;
      //To determine if a point (x,y) is inside or on the boundary of an axis-aligned ellipse centered at (h,k) with semi-axes a and b, 
      // check if ((x-h)^2)/(a^2)+((y-k)^2)/(b^2) <= 1 
      // If the result is <1, the point is inside; if =1, it is on the boundary
    }

    if (shape.type === "triangle") {
      return Math.hypot(x - shape.x, y- shape.y) <= shape.radius;
    }

    if (shape.type === "line" || shape.type === "straight") {
      return shape.points.some((_, i) => {
        if (i % 2 !== 0) return false;
        const px = shape.points[i];
        const py = shape.points[i + 1];
        return Math.hypot(px - x, py - y) < 6;
      });
    }

    if (shape.type === "text") {
      const textWidth = shape.text.length * shape.fontSize * 0.6;
      const textHeight = shape.fontSize * 1.2;
      return (
        x >= shape.x &&
        x <= shape.x + textWidth &&
        y >= shape.y - textHeight &&
        y <= shape.y
      );
    }

    return false;

  }
  const handlePointerDown = (e) => {
    const stage = stageRef.current;
    if (!stage) return;

    // Detect touch device
    const isTouch = e.evt?.pointerType === 'touch' || e.evt?.touches?.length > 0;
    if (isTouch) {
      isTouchDevice.current = true;
      touchStartPos.current = stage.getPointerPosition();
      touchStartTime.current = Date.now();
      
      // Track touches for two-finger pan
      if (e.evt?.touches) {
        touchesRef.current = Array.from(e.evt.touches).map(t => ({
          id: t.identifier,
          x: t.clientX,
          y: t.clientY
        }));
        
        // Two-finger touch = always pan (works with any tool)
        if (touchesRef.current.length >= 2) {
          isPanningRef.current = true;
          const center = getTouchCenter(touchesRef.current[0], touchesRef.current[1]);
          lastPanPos.current = { x: center.x, y: center.y };
          return;
        }
      }
    }

    if (tool === "pan") {
      isPanningRef.current = true;
      lastPanPos.current = stage.getPointerPosition();
      return;
    }

    // On touch devices, allow panning with one finger when using select tool and not hitting a shape
    if (tool === "select") {
      const pos = getWorldPos();
      if (!pos) return;

      const hitShape = [...shapes].reverse().find(shape => hitTest(shape, pos.x, pos.y));

      if (hitShape) {
        setSelectedId(hitShape.id);
        // Don't pan if we hit a shape
        return;
      } else {
        setSelectedId(null);
        // On touch devices, prepare for potential panning (will be enabled on move if moved enough)
        if (isTouch) {
          // Don't enable panning immediately - wait for movement to distinguish tap from drag
          return;
        }
      }
      return;
    }
    if (textInput) return;

    const pos = getWorldPos();
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
      shapesBeforeEraseRef.current = [...shapes];
      scheduleEraseAtPoint(pos.x, pos.y);
    }

    if (tool === "text") {
      const rect = stage.container().getBoundingClientRect();
      setTextInput({
        screenX: rect.left + camera.x + pos.x * camera.scale,
        screenY: rect.top + camera.y + pos.y * camera.scale,
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
  const handlePointerMove = (e) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pos = getWorldPos();
    if (!pos) return;

    // Handle two-finger pan on touch devices
    const isTouch = e?.evt?.pointerType === 'touch' || e?.evt?.touches?.length > 0;
    if (isTouch && e.evt?.touches?.length >= 2) {
      const touches = Array.from(e.evt.touches);
      const center = getTouchCenter(touches[0], touches[1]);
      const currentPos = { x: center.x, y: center.y };
      
      if (!isPanningRef.current) {
        isPanningRef.current = true;
        lastPanPos.current = currentPos;
      } else {
        const dx = currentPos.x - lastPanPos.current.x;
        const dy = currentPos.y - lastPanPos.current.y;
        
        setCamera(cam => ({
          ...cam,
          x: cam.x + dx,
          y: cam.y + dy,
        }));
        
        lastPanPos.current = currentPos;
      }
      return; // Don't process other actions during two-finger pan
    }

    // On touch devices with select tool, enable panning if user moves finger significantly
    if (tool === "select" && (isTouch || isTouchDevice.current) && touchStartPos.current && !isPanningRef.current) {
      const currentPos = stage.getPointerPosition();
      if (currentPos && touchStartPos.current) {
        const dx = currentPos.x - touchStartPos.current.x;
        const dy = currentPos.y - touchStartPos.current.y;
        const distance = Math.hypot(dx, dy);
        
        // If moved more than 10px, enable panning
        if (distance > 10) {
          isPanningRef.current = true;
          lastPanPos.current = touchStartPos.current;
          setSelectedId(null); // Clear selection when panning starts
        }
      }
    }

    if (isDrawing && tool === "eraser") {
      scheduleEraseAtPoint(pos.x, pos.y);
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
              radius: Math.max(1, Math.min(Math.abs(pos.x - shape.x), Math.abs(pos.y - shape.y))),
            };
          }

          if (shape.type === "circle") {
            return {
              ...shape,
              radius: Math.max(1, Math.hypot(pos.x - shape.x, pos.y - shape.y)),
            };
          }

          if (shape.type === "ellipse") {
            return {
              ...shape,
              radiusX: Math.max(1, Math.abs(pos.x - shape.x)),
              radiusY: Math.max(1, Math.abs(pos.y - shape.y)),
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

    if (isPanningRef.current) {
      const posPix = stage.getPointerPosition();
      if (!posPix) return;
      const dx = posPix.x - lastPanPos.current.x;
      const dy = posPix.y - lastPanPos.current.y;

      // Pan in screen space
      setCamera(cam => ({
        ...cam,
        x: cam.x + dx,
        y: cam.y + dy,
      }));

      lastPanPos.current = posPix;
      return;
    }
  };

  /* ---------------------------------
     Pointer Up
  ---------------------------------- */
  const handlePointerUp = (e) => {
    const isTouch = e.evt?.pointerType === 'touch' || e.evt?.touches?.length > 0;
    
    // Update touches tracking
    if (isTouch && e.evt?.touches) {
      touchesRef.current = Array.from(e.evt.touches).map(t => ({
        id: t.identifier,
        x: t.clientX,
        y: t.clientY
      }));
      
      // If still have 2+ touches, keep panning
      if (touchesRef.current.length >= 2) {
        return;
      }
    }
    
    // On touch devices, check if this was a pan gesture (moved significantly)
    if (isTouch && isPanningRef.current && touchStartPos.current) {
      const currentPos = stageRef.current?.getPointerPosition();
      if (currentPos && touchStartPos.current) {
        const dx = currentPos.x - touchStartPos.current.x;
        const dy = currentPos.y - touchStartPos.current.y;
        const distance = Math.hypot(dx, dy);
        
        // If moved more than 10px, it was a pan gesture - don't trigger other actions
        if (distance > 10) {
          isPanningRef.current = false;
          touchStartPos.current = null;
          touchesRef.current = [];
          return;
        }
      }
    }

    if (tool === "select" && selectedId) {
      commitShapes(shapes); // push to undo stack
    }
    if (isDrawing || drawingShapeId) {
      if (tool === "eraser" && shapesBeforeEraseRef.current) {
        commitShapes([...shapes], shapesBeforeEraseRef.current);
        shapesBeforeEraseRef.current = null;
      } else {
        commitShapes([...shapes]);
      }
    }
    // Stop panning
    if (isPanningRef.current) {
      isPanningRef.current = false;
    }
    touchStartPos.current = null;
    setIsDrawing(false);
    setDrawingShapeId(null);
  };

  /* ---------------------------------
     Text Commit
  ---------------------------------- */
  const commitText = () => {
    if (isTextInputNewRef.current) return;
    if (isDrawing || drawingShapeId) {
      commitShapes([...shapes]);
    }

    let newShapes;
    setShapes(prev => {
      if (!textInput.value.trim()) {
        newShapes = textInput.editId
          ? prev.filter(s => s.id !== textInput.editId)
          : prev;
        return newShapes;
      }

      if (textInput.editId) {
        newShapes = prev.map(s =>
          s.id === textInput.editId ? { ...s, text: textInput.value } : s
        );
        return newShapes;
      }

      newShapes = [
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
      return newShapes;
    });

    // Commit the updated shapes after state update
    setTimeout(() => {
      commitShapes(newShapes);
    }, 0);

    setTextInput(null);
    setEditingId(null);
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

  // Segment-based erasing for freehand pen lines (more accurate than point-only checks)
  const eraseLineSmoothly = (line, x, y, radius) => {
    const points = line.points || [];
    if (points.length < 4) return [line];

    const out = [];
    let current = [];

    // Start current segment with first point
    current.push(points[0], points[1]);

    for (let i = 0; i < points.length - 2; i += 2) {
      const ax = points[i];
      const ay = points[i + 1];
      const bx = points[i + 2];
      const by = points[i + 3];

      const d = pointToLineDistance(x, y, ax, ay, bx, by);
      const hit = d <= radius;

      if (hit) {
        // close current segment if it has at least 2 points
        if (current.length >= 4) {
          out.push({ ...line, points: [...current] });
        }
        current = [];
        continue;
      }

      if (current.length === 0) {
        current.push(ax, ay);
      }
      current.push(bx, by);
    }

    if (current.length >= 4) {
      out.push({ ...line, points: current });
    }

    return out;
  };

  const eraseAtPointPure = (prevShapes, x, y) =>
    prevShapes.flatMap((shape) => {
      if (shape.type === "text") return [shape];

      if (shape.type === "line" && isPointNearLine(x, y, shape, eraserSize)) return [];
      if (shape.type === "rect" && isPointInRect(x, y, shape)) return [];
      if (shape.type === "circle" && isPointInCircle(x, y, shape)) return [];
      if (shape.type === "ellipse" && isPointInEllipse(x, y, shape)) return [];
      if (shape.type === "triangle" && isPointInTriangle(x, y, shape)) return [];
      if (
        (shape.type === "lineStraight" || shape.type === "arrow") &&
        isPointNearLine(x, y, shape, eraserSize)
      )
        return [];

      return [shape];
    });

  const scheduleEraseAtPoint = (x, y) => {
    pendingEraseRef.current = { x, y };
    if (eraserRafRef.current) return;

    eraserRafRef.current = requestAnimationFrame(() => {
      eraserRafRef.current = 0;
      const p = pendingEraseRef.current;
      if (!p) return;
      pendingEraseRef.current = null;
      setShapes((prev) => eraseAtPointPure(prev, p.x, p.y));
    });
  };

  /* ---------------------------------
     Wheel Zoom (trackpad / mouse)
  ---------------------------------- */
  const handleWheel = (e) => {
    const stage = stageRef.current;
    if (!stage) return;

    const evt = e.evt;
    // prevent page scroll / browser zoom
    evt.preventDefault();

    // Trackpad / mouse wheel provides:
    // - two‑finger scroll  -> pan (no ctrlKey)
    // - pinch zoom gesture -> zoom (ctrlKey usually true on Mac/trackpads)
    const isZoomGesture = evt.ctrlKey || evt.metaKey;

    if (!isZoomGesture) {
      // Simple pan: move canvas opposite to scroll direction
      const { deltaX, deltaY } = evt;
      setCamera((cam) => ({
        ...cam,
        x: cam.x - deltaX,
        y: cam.y - deltaY,
      }));
      return;
    }

    // Zoom around pointer position
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const direction = evt.deltaY > 0 ? 1 : -1;

    setCamera((cam) => {
      const oldScale = cam.scale;
      const newScaleRaw =
        direction > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      const newScale = Math.min(5, Math.max(0.2, newScaleRaw));

      // world coords under the mouse before zoom
      const worldX = (pointer.x - cam.x) / oldScale;
      const worldY = (pointer.y - cam.y) / oldScale;

      return {
        ...cam,
        scale: newScale,
        x: pointer.x - worldX * newScale,
        y: pointer.y - worldY * newScale,
      };
    });
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
        x={camera.x}
        y={camera.y}
        scaleX={camera.scale}
        scaleY={camera.scale}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <Layer>
          {shapes.map(shape =>
            renderShape({
              shape,
              selectedId,
              editingId,
              onSelect: setSelectedId,
              onDragMove: (id, pos) => {
                setShapes(prev =>
                  prev.map(s =>
                    s.id === id ? { ...s, x: pos.x, y: pos.y } : s
                  )
                );
              },
              onDragEnd: () => {
                commitShapes(shapes);
              },
              onDblClick: (shape) => {
                if (shape.type === 'text') {
                  const stage = stageRef.current;
                  const rect = stage.container().getBoundingClientRect();
                  const screenX = rect.left + (shape.x * camera.scale + camera.x);
                  const screenY = rect.top + (shape.y * camera.scale + camera.y) + shape.fontSize * 0.5;
                  setEditingId(shape.id);
                  setTextInput({
                    screenX,
                    screenY,
                    canvasX: shape.x,
                    canvasY: shape.y,
                    value: shape.text,
                    fontSize: shape.fontSize,
                    editId: shape.id,
                  });
                }
              },
            })
          )}
        </Layer>
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
