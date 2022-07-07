import axios from 'axios';
import config from '../config';

export const stateApi = axios.create({
  baseURL: `${config.API_ENDPOINT}/v1`,
});
