import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/css/index.css';
import GameComponent from './components/GameComponent';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <GameComponent />
  </React.StrictMode>
);
