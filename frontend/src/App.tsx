import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Chat from './pages/Chat'
import Practice from './pages/Practice'
import Syllabus from './pages/Syllabus'
import Rooms from './pages/Rooms'
import Company from './pages/Company'
import Interview from './pages/Interview'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* App pages - inside sidebar shell */}
        <Route element={<AppShell />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/company" element={<Company />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
