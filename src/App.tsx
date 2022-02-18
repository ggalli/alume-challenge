import { Routes, Route, BrowserRouter } from "react-router-dom";

import { BuyTicket } from './pages/buy-ticket';

import './styles/app.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/buy-ticket" element={<BuyTicket />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
