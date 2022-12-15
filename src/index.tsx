import React from 'react';
import ReactDOM from 'react-dom';
import 'wicg-inert';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
window.configLocation = `https://jsonblob.com/api/jsonBlob/1052916996878123008`;
ReactDOM.render(<App />, document.getElementById('root'));

registerSW();
