import { useState } from 'react'
import {Routes, Route} from 'react-router'
import Private from './layouts/Private'
import Public from './layouts/Public'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  

  return (
    <main className='absolute h-full w-full bg-green-600'>
      <Routes>
        <Route element={<Public />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<Private />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </main>
  )
}

export default App
