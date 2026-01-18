import {Routes, Route} from 'react-router'
import Private from './layouts/Private'
import Public from './layouts/Public'
import Login from './components/Login'
import Register from './components/Register'
import Lobby from './components/Lobby'
import GameTable from './components/GameTable'
import GameProvider from './context/GameContext'
import './App.css'

function App() {
  return (
    <GameProvider>
      <main className='absolute h-full w-full bg-gray-900'>
        <Routes>
          <Route element={<Public />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<Private />}>
            <Route path="/" element={<Lobby />} />
            <Route path="/table/:id" element={<GameTable />} />
          </Route>
        </Routes>
      </main>
    </GameProvider>
  )
}

export default App
