import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "https://yours-ten.vercel.app",
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  console.log(`Adding user: ${userId} with socket ID: ${socketId}`);
  const userExits = onlineUser.find((user) => user.userId === userId);
  if (!userExits) {
    onlineUser.push({ userId, socketId });
    console.log("Current online users:", onlineUser);
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  console.log(`Fetching user with ID: ${userId}`);
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
  
    if (!receiver) {
      console.log(`User with ID ${receiverId} is not online.`);
      return;  // Don't try to emit to a non-existent user
    }
  
    io.to(receiver.socketId).emit("getMessage", data);
  });
  

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen("4000");
