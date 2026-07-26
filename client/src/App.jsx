import { useState, useEffect } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsSignup(true);
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div>
      {isSignup ? (
        <Signup 
          onSignupSuccess={() => setIsLoggedIn(true)} 
          onToggleLogin={() => setIsSignup(false)}
        />
      ) : (
        <Login 
          onLoginSuccess={() => setIsLoggedIn(true)} 
          onToggleSignup={() => setIsSignup(true)}
        />
      )}
    </div>
  );
}

export default App;