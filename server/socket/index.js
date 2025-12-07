import {Server} from "socket.io";
import {verifyAccessToken} from "../config/jwt.js";

const setupSocket = (httpServer) => {
    const io = new Server(httpServer,{
        cors : {
            origin : process.env.FRONTEND_URL,
            credentials : true
        }
        // only allow frontend to connect to socket server
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        // socket comes from client i.e frontend

        // authenticate socket connection
        socket.on("authenticate", (accessToken)=>{
            try {
                const decoded = verifyAccessToken(accessToken);
                if (!decoded) {
                    socket.emit("unauthorized", {message : "Invalid Token"});
                    socket.disconnect();
                    return;
                }
                socket.userId = decoded.id;
                socket.emit("authenticated", {message : "Socket Authenticated"});
                console.log(`Socket ${socket.id} authenticated as user ${socket.userId}`);

            }
            catch (error) {
                console.error("Socket authentication error:", error);
                socket.emit("unauthorized", {message : "Authentication Error"});
                socket.disconnect();
            }
        });

        // join room
        // creating roomId by noteid to send updates to specific note collaborators
        socket.on("join_note", (noteId)=>{
            socket.join(noteId);
            console.log('User', socket.userId, 'joined note room:', noteId);
        });

        // leave room
        // auto delete room when all users leave
        socket.on("leave_note", (noteId)=>{
            socket.leave(noteId);
            console.log('User', socket.userId, 'left note room:', noteId);
        });

        // broadcast shape updates
        socket.on("shape_update", ({noteId, shapeData})=> {
            // broadcast to all clients in the room except sender
            // using to because sender already has the latest data
            // can also use in as it will also broadcast to all clients including sender 
            socket.to(noteId).emit("shape_update", {
                shapeData, 
                senderId: socket.userId
            });
        });

        // broadcast cursor position updates
        socket.on("cursor_move", ({noteId, position})=>{
            socket.to(noteId).emit("receive_cursor", {
                userId: socket.userId,
                position
            });
            // position = {x: number, y: number}
        });

        // simply a listner when the socket is disconnected automatically
        socket.on("disconnect", ()=>{
            console.log("Socket disconnected:", socket.id);
        });
    });
}

export default setupSocket;

/**
 * socket class structure
 * {
 *  id : string,
 *  userId : string, // set after authentication
 *  connectedAt : Date,
 *  disconnectedAt : Date | null,
 *  rooms : Array<string>,
 *  data : Object
 * }
 */