import {Rect, Circle, Ellipse, Line, Arrow, RegularPolygon, Text} from "react-konva";

const renderShape = (shape) => {
  switch (shape.type) {
    case "rect":
      return (
        <Rect
          key={shape.id}
          x={shape.x}
          y={shape.y}
          width={Math.max(1, shape.width)}
          height={Math.max(1, shape.height)}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          fill={shape.fillEnabled ? shape.fill : undefined}
          listening={false}
        />
      );

    case "circle":
      return (
        <Circle
          key={shape.id}
          x={shape.x}
          y={shape.y}
          radius={Math.max(1, shape.radius)}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          fill={shape.fillEnabled ? shape.fill : undefined}
          listening={false}
        />
      );

    case "ellipse":
      return (
        <Ellipse
          key={shape.id}
          x={shape.x}
          y={shape.y}
          radiusX={Math.max(1, shape.radiusX)}
          radiusY={Math.max(1, shape.radiusY)}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          fill={shape.fillEnabled ? shape.fill : undefined}
          listening={false}
        />
      );

    case "lineStraight":
      return (
        <Line
          key={shape.id}
          x={shape.x}
          y={shape.y}
          points={shape.points}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          lineCap="round"
          lineJoin="round"
          listening={false}
        />
      );

    case "arrow":
      return (
        <Arrow
          key={shape.id}
          x={shape.x}
          y={shape.y}
          points={shape.points}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          fill={shape.stroke}
          pointerLength={shape.pointerLength}
          pointerWidth={shape.pointerWidth}
          listening={false}
        />
      );

    case "triangle": {
      const w = Math.max(1, shape.width);
      const h = Math.max(1, shape.height);
      const radius = Math.min(w, h) / 2;

      return (
        <RegularPolygon
          key={shape.id}
          x={shape.x + w / 2}
          y={shape.y + h / 2}
          sides={3}
          radius={radius}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          fill={shape.fillEnabled ? shape.fill : undefined}
          listening={false}
        />
      );
    }

    case "line": // freehand pen
      return (
        <Line
          key={shape.id}
          points={shape.points}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          listening={false}
        />
      );

    case "text":
      return (
        <Text
          key={shape.id}
          x={shape.x}
          y={shape.y}
          text={shape.text}
          fontSize={shape.fontSize}
          fill={shape.fill}
          listening={false}
        />
      );

    default:
      return null;
  }
};

export default renderShape;