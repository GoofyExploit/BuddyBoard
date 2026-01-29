import { Rect, Line, Text } from "react-konva";

const renderShape = (shape) => {
  switch (shape.type) {
    case "rect":
      return <Rect key={shape.id} {...shape} />;
    case "line":
      return <Line key={shape.id} {...shape} lineCap="round" />;
    case "text":
      return <Text key={shape.id} {...shape} />;
    default:
      return null;
  }
};

export default renderShape;
