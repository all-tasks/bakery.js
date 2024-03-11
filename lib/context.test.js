import createContext from './context.js';

const context = createContext();

context.response();

console.log(context.response.status);
