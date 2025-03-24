import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "https://yours-ten.vercel.app",  // Update with your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
  if (!onlineUsers.some((user) => user.userId === userId)) {
    onlineUsers.push({ userId, socketId });
    console.log(`User added: ${userId} - Socket ID: ${socketId}`);
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
  console.log(`User disconnected: Socket ID ${socketId}`);
};

const getUser = (userId) => onlineUsers.find((user) => user.userId === userId);

io.on("connection", (socket) => {
  console.log("A user connected!");

  // Add new user
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
    console.log("Current online users:", onlineUsers);
  });

  // Send message
  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);

    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
      console.log(`Message sent to ${receiverId}:`, data);
    } else {
      console.log(`User with ID ${receiverId} is not online.`);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("User disconnected!");
  });
});

// Listen on dynamic or default port
const PORT = process.env.PORT || 4000;
io.listen(PORT, () => {
  console.log(`Socket server listening on port ${PORT}`);
});
