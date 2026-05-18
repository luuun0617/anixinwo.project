import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/all.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './assets/all.scss'
import { AuthProvider } from './context/AuthContext';
import { Provider } from 'react-redux';
import store from './store/store';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import 'virtual:svg-icons-register';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
