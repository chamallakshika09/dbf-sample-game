// const config = {
//   API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT,
//   BASE_URL: process.env.REACT_APP_BASE_URL,
// };

const prod = {
  // ENDPOINT: 'http://54.251.88.140',
  API_ENDPOINT: 'https://dbf-sample-game.herokuapp.com/api',
  BASE_URL: 'https://dbf-sample-game.herokuapp.com',
};

const dev = {
  API_ENDPOINT: 'http://localhost:3010/api',
  BASE_URL: 'http://localhost:3010',
};
const config = process.env.NODE_ENV === 'development' ? dev : prod;

export default config;
