import { createRoot } from 'react-dom/client'
import './index.css'
import App from './components/App/App'
import store from './components/store/Store'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App/>
  </Provider>,
)