import { Rect, Line, Text } from "react-konva";

const renderShape = (shape) => {
  switch (shape.type) {
    case "rect":{
      const x = shape.width < 0 ? shape.x + shape.width : shape.x;
      const y = shape.height < 0 ? shape.y + shape.height : shape.y;
      const width = Math.abs(shape.width);
      const height = Math.abs(shape.height);

      return (
        <Rect
          key={shape.id}
          x={x}
          y={y}
          width={width}
          height={height}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          fill={shape.fillEnabled ? shape.fill : "transparent"}
        />
      );
    }
    case "line":
      return <Line key={shape.id} {...shape} lineCap="round" />;
    case "text":
      return <Text key={shape.id} {...shape} />;
    default:
      return null;
  }
};

export default renderShape;
