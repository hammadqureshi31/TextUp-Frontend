import { setupMessagingSocket, setupCallingSocket } from "./socket.js";
import { createServer } from "http";
import dotenv from 'dotenv';
import { app } from "./app.js";
import { connectDB } from "./DB.js";

dotenv.config({ path: './.env' });

const server = createServer(app);
connectDB();

// Initialize both socket servers on the same HTTP server
setupMessagingSocket(server);
setupCallingSocket(server);

server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port: ${process.env.PORT}`);
});
