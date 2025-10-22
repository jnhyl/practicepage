import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import DiaryDetail from './pages/DiaryDetail';
import DiaryForm from './pages/DiaryForm';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyDiaries from './pages/MyDiaries';
import MyComments from './pages/MyComments';
import EditProfile from './pages/EditProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/diary/:id" element={<DiaryDetail />} />
          <Route path="/create" element={<DiaryForm />} />
          <Route path="/edit/:id" element={<DiaryForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/my/diaries" element={<MyDiaries />} />
          <Route path="/my/comments" element={<MyComments />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
