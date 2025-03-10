import { Controller, Get } from "routing-controllers";
import { logger } from "@/services/logger.service";

@Controller("/health")
export class HealthController {
  @Get()
  check() {
    logger.debug("Health check endpoint called");
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
