import CanvasStage from "../components/canvas/CanvasStage";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchNote, updateNote } from "../api/note.api";
import ToolBar from "../components/toolbar/Toolbar";
import socket from "../socket/socket";



const NotePage = () => {
  const { id } = useParams();

  const [shapes, setShapes] = useState([]);
  const [toolState, setToolState] = useState({
    tool: "select",
    strokeColor: "#000000",
    strokeWidth: 2,
    eraserSize: 12,
  });

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const historyRef = useRef([]);
  const futureRef = useRef([]);
  const shapesRef = useRef(shapes);
  const isUndoRedoInProgress = useRef(false);

  useEffect (() => {
    socket.emit("join_note", id);

    return () => {
      socket.off("shape_update");
    }
  }, [id]);

  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    futureRef.current = future;
  }, [future]);

  useEffect(() => {
    const load = async () => {
      const res = await fetchNote(id);
      setShapes(res.data.shapes || []);
    };
    load();
  }, [id]);

  useEffect(() => {
    const onRemoteUpdate = ({ shapeData }) => {
      setShapes(shapeData);
    };

    socket.on("shape_update", onRemoteUpdate);

    return () => {
      socket.off("shape_update", onRemoteUpdate);
    };
  }, []);


  const commitShapes = async (newShapes, prevShapes = null) => {
    setHistory(prev => [...prev.slice(-50), prevShapes || shapes]);
    setFuture([]);
    setShapes(newShapes);

    socket.emit("shape_update", {
      noteId : id,
      shapeData: newShapes
    });

    await updateNote(id, { shapes: newShapes });
  };

  const undo = useCallback(() => {
    if (isUndoRedoInProgress.current) return;
    isUndoRedoInProgress.current = true;
    const currentHistory = historyRef.current;
    if (currentHistory.length === 0) {
      isUndoRedoInProgress.current = false;
      return;
    }
    const last = currentHistory[currentHistory.length - 1];
    setFuture(f => [shapesRef.current, ...f]);
    setShapes(last);
    setHistory(currentHistory.slice(0, -1));
    setTimeout(() => {
      isUndoRedoInProgress.current = false;
    }, 100);
  }, [setShapes, setHistory, setFuture]);

  const redo = useCallback(() => {
    if (isUndoRedoInProgress.current) return;
    isUndoRedoInProgress.current = true;
    const currentFuture = futureRef.current;
    if (currentFuture.length === 0) {
      isUndoRedoInProgress.current = false;
      return;
    }
    const next = currentFuture[0];
    setHistory(h => [...h, shapesRef.current]);
    setShapes(next);
    setFuture(currentFuture.slice(1));
    setTimeout(() => {
      isUndoRedoInProgress.current = false;
    }, 100);
  }, [setShapes, setHistory, setFuture]);

  useEffect(() => {
    const onKey = (e) => {
      const isUndo = (e.ctrlKey || e.metaKey) && e.key === "z";
      const isRedo = (e.ctrlKey || e.metaKey) && e.key === "y";

      if (isUndo) {
        e.preventDefault();
        undo();
      }

      if (isRedo) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return (
    <div className="h-screen relative">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        <ToolBar
          toolState={toolState}
          setToolState={setToolState}
        />
      </div>

      <CanvasStage
        shapes={shapes}
        setShapes={setShapes}
        commitShapes={commitShapes}
        tool={toolState.tool}
        strokeColor={toolState.strokeColor}
        strokeWidth={toolState.strokeWidth}
        eraserSize={toolState.eraserSize}
      />
    </div>
  );
};

export default NotePage;
