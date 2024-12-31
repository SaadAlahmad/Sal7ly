import { useState } from 'react'
import Layout from './components/Layout'
import HomePage from './components/HomePage'
import SearchPage from './components/SearchPage'
import CategoriesPage from './components/CategoriesPage'
import CategoryPage from './components/CategoryPage';
import ProfilePage from './components/ProfilePage'
import RequestPage from './components/RequestPage'
import SupportPage from './components/SupportPage'
import SignUpPage from './components/SignupPage'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './css/App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/categories" element={<Layout><CategoriesPage /></Layout>} />
          <Route path="/categories/:category" element={<Layout><CategoryPage /></Layout>} />
          <Route path="/profile/:id" element={<Layout><ProfilePage /></Layout>} />
          <Route path="/request" element={<Layout><RequestPage /></Layout>} />
          <Route path="/help" element={<Layout><SupportPage /></Layout>} />
          {/* <Route path="/login" element={<LoginPage />} /> */}
          <Route path="/signup" element={<Layout><SignUpPage /></Layout>} />
        </Routes>
      </HashRouter>
    </>
  )
}

export default App
