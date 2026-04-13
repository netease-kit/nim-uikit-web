import logDebug, { createLoggerDecorator } from "yunxin-log-debug";
import packageJson from "../../../../package.json";

const logger = logDebug({
  appName: packageJson.name,
  version: packageJson.version,
  level: "trace",
  storeWindow: true,
});

export { createLoggerDecorator };

export default logger;
