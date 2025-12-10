import Developement from "./dev";
import Production from "./prod";

const env: any = import.meta.env.NODE_ENV;

const config = env === "development" ? Developement : Production;

export default config;
