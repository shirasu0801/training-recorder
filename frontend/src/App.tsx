import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import History from './pages/History';
import Stats from './pages/Stats';
import Plans from './pages/Plans';
import Goals from './pages/Goals';

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
};

function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Header />
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/history" element={<History />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/goals" element={<Goals />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
