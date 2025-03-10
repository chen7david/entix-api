import { createApp } from "./app";
import { logger } from "@/services/logger.service";

const PORT = process.env.PORT || 3000;

/**
 * Starts the server on the specified port
 * @returns The HTTP server instance
 */
export function startServer() {
  const app = createApp();

  const server = app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
  });

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("SIGTERM signal received: closing HTTP server");
    server.close(() => {
      logger.info("HTTP server closed");
    });
  });

  return server;
}

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}
