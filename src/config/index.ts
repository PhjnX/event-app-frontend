import Developement from "./dev";
import Production from "./prod";

const env: any = import.meta.env.NODE_ENV;

const config = env === "development" ? Developement : Production;

// let configs = {};
// if (env === 'development') {
//   configs = {apiUrl: 'http://localhost:3000/dev/api'};
// } else {
//   configs = {apiUrl: 'http://localhost:3000/prod/api'};
// }

export default config;
