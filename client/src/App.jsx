import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import SignUpPage from './component/signUp'
import Home from './pages/Home';
import SsoCallback from './component/SsoCallback';

function App() {
  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<SignUpPage/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/sso" element={<SsoCallback/>} />
        
      </Routes>
    </Router>
    </>
  )
}

export default App
