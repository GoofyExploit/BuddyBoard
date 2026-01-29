import CanvasStage from "../components/canvas/CanvasStage";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
// useParams is used to get the id param from the url
// used to get the note id from the url
import {fetchNote, updateNote} from "../api/note.api";
import ToolBar from "../components/toolbar/Toolbar";

const NotePage = () => {

  const {id} = useParams();

  const [shapes, setShapes] = useState([]);
  const [toolState, setToolState] = useState({
    tool : "select",
    strokeColor : "#000000",
    strokeWidth : 2,
    fillColor : "#000000",
  })

  useEffect(()=> {
    const load = async() =>{
      const res = await fetchNote(id);
      setShapes(res.data.shapes || []);
    };
    load();
  }, [id]);

  const saveShapes = async (newShapes) => {
    setShapes(newShapes);
    await updateNote(id, {shapes: newShapes});
  };

  return (
    <div className = "h-screen flex flex-col">
      <ToolBar
        toolState={toolState}
        setToolState={setToolState}
      />


      <CanvasStage
        shapes={shapes}
        setShapes={setShapes}
        tool={toolState.tool}
        strokeColor={toolState.strokeColor}
        fillColor={toolState.fillColor}
        strokeWidth={toolState.strokeWidth}
      />
    </div>
  );
};

export default NotePage;