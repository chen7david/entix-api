class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(message: string) {
    console.log(message);
  }

  public error(message: string) {
    console.error(message);
  }

  public warn(message: string) {
    console.warn(message);
  }

  public debug(message: string) {
    console.debug(message);
  }

  public info(message: string) {
    console.info(message);
  }

  public trace(message: string) {
    console.trace(message);
  }
}

export const logger = Logger.getInstance();
