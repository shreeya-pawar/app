import { io } from 'socket.io-client';

const backendURL = process.env.REACT_APP_BACKEND_URL;
const socket = io(backendURL);

export default socket;
