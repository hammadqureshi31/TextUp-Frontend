import { Server } from "socket.io";
import { Message } from "./models/messageModel.js";
import { User } from "./models/userModel.js";
import { model } from "mongoose";

// Messaging socket setup
export const setupMessagingSocket = (server) => {
  const io = new Server(server, {
    path: "/messaging",
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // console.log("Messaging socket connected:", socket.id);

    // Join a room and mark messages as read
    socket.on("join-room", async (data) => {
      const { userId, roomId, mode } = data;
      console.log("testing.....", userId, "roomid", roomId, "mode", mode);
      if (roomId || userId || mode) {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}, mode=${mode}`);

        try {
          if (mode === "group") {
            // Fetch messages in the group that are unread and not sent by the joining user
            const messagesToUpdate = await Message.find({
              receiver: roomId,
              mode,
              unread: false,
            });

            // Filter out messages not sent by the current user
            const filterUserMsgs = messagesToUpdate.filter(
              (msg) => msg.sender.toString() !== userId.toString()
            );

            // Extract the IDs of the messages to update
            const userMessages = filterUserMsgs.map((msg) => msg._id);

            if (userMessages?.length > 0) {
              // Update only the filtered messages
              await Message.updateMany(
                { _id: { $in: userMessages } },
                { $set: { unread: true } }
              );
            }

            console.log("group msgs marked as read...");
          } else {
            // For direct messages
            await Message.updateMany(
              { receiver: userId, sender: roomId, unread: false },
              { $set: { unread: true } }
            );

            console.log("marked as read...");
          }

          io.to(roomId).emit("read-message", {
            message: "All messages marked as read.",
          });
        } catch (error) {
          console.error("Error updating unread messages:", error);
        }
      }
    });

    socket.on("new-message", async (message) => {
      const { mode, content, senderId, chatId, imageURL } = message;

      // Validate required fields
      if (!senderId || !chatId || (!content && !imageURL)) {
        console.error("Incomplete message data received.");
        return;
      }

      try {
        // Save the new message to the database
        const newMessage = await Message.create({
          mode,
          sender: senderId,
          receiver: chatId,
          content: content || null,
          imageURL: imageURL || null,
        });

        // Emit the new message to all clients in the room
        io.emit("receive-message", newMessage);
      } catch (error) {
        console.error("Error saving message:", error); 
      }
    });

    // Set last seen and online status
    socket.on("set-lastseen-and-online", async (data) => {
      // console.log("set-lastseen-and-online event received");
      try {
        const { userId, online } = data;
        if (userId) {
          socket.userId = userId;
          await User.findByIdAndUpdate(userId, {
            lastSeen: Date.now(),
            isOnline: online,
          });
        }
        io.emit("update-lastseen-and-online", {
          message: true,
        });
      } catch (error) {
        console.error("Error in setting lastseen and online status:", error);
      }
    });

    socket.on("typing", ({ sender, name, groupID, mode }) => {
      // console.log("typing", groupID);
      socket.broadcast.emit("typing", { sender, name, groupID, mode });
    });

    // Handle disconnect event to set user offline and update last seen
    socket.on("disconnect", async () => {
      // console.log("User disconnected:", socket.id);
    });
  });
};

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

// Calling socket setup
export const setupCallingSocket = (server) => {
  const callIo = new Server(server, {
    path: "/calling",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  callIo.on("connection", (socket) => {
    // console.log(`Socket Connected`, socket.id);

    socket.on("joined", ({ userId, socketId }) => {
      console.log(userId, socketId, socket.id);
      socket.userId = userId;
      emailToSocketIdMap.set(userId, socketId);
      socketidToEmailMap.set(socketId, userId);
    });

    socket.on("make:call", ({ userId, from, offer, callMode }) => {
      callIo.to(emailToSocketIdMap.get(userId)).emit("incoming:call", { from, offer, userId, callMode });
      console.log(`Socket make call`, callMode);
    });

    socket.on("call:accepted", ({ userId, ans }) => {
      callIo.to(emailToSocketIdMap.get(userId)).emit("call:accepted", {from: socket.id, ans});
      console.log("ans",ans)
      console.log(`Socket all:accepted`);
    });

    socket.on("reject:call", ({ userId }) => {
      console.log("userid who reject's:",userId)
      callIo.to(emailToSocketIdMap.get(userId)).emit("call:rejected", { from: socket.id });
      console.log(`Socket reject:call`);
    });

    socket.on("peer:nego:needed", ({ offer, userId }) => {
      console.log("peer:nego:needed", offer);
      console.log("peer:nego:user", userId);
      callIo.to(emailToSocketIdMap.get(userId)).emit("peer:nego:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ ans, userId }) => {
      console.log("peer:nego:done", ans);
    
      // Ensure the answer object is valid
      if (!ans || !ans.type || !ans.sdp) {
        console.error("Invalid answer received:", ans);
        return;
      }
    
      callIo.to(userId).emit("peer:nego:final", { from: socket.id, ans });
    });

    socket.on("disconnect", () => {
      socketidToEmailMap.delete(socket.id);
    });
  });
};
