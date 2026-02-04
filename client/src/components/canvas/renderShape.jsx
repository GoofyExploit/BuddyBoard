import {
  Rect,
  Circle,
  Ellipse,
  Line,
  Arrow,
  RegularPolygon,
  Text,
} from "react-konva";

const renderShape = ({
  shape,
  selectedId,
  editingId,
  onSelect,
  onDragMove,
  onDragEnd,
  onDblClick,
}) => {
  const isSelected = shape.id === selectedId;

  const commonProps = {
    draggable: isSelected,
    onPointerDown: (e) => {
      e.cancelBubble = true; // prevent stage deselect
      onSelect(shape.id);
    },
    onDragMove: (e) => {
      onDragMove(shape.id, {
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    onDragEnd: (e) => {
      onDragEnd(shape.id, {
        x: e.target.x(),
        y: e.target.y(),
      });
    },
  };

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
          {...commonProps}
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
          {...commonProps}
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
          {...commonProps}
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
          {...commonProps}
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
          {...commonProps}
        />
      );

    case "triangle": {
      return (
        <RegularPolygon
          key={shape.id}
          x={shape.x}
          y={shape.y}
          sides={3}
          radius={Math.max(1, shape.radius)}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          fill={shape.fillEnabled ? shape.fill : undefined}
          {...commonProps}
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
          {...commonProps}
        />
      );

    case "text":
      if (shape.id === editingId) return null;
      return (
        <Text
          key={shape.id}
          x={shape.x}
          y={shape.y}
          text={shape.text}
          fontSize={shape.fontSize}
          fill={shape.fill}
          onDblClick={() => onDblClick(shape)}
          {...commonProps}
        />
      );

    default:
      return null;
  }
};

export default renderShape;
