import { Link, useLocation } from 'react-router-dom';

const styles = {
  header: {
    backgroundColor: '#1976d2',
    color: 'white',
    padding: '0 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    padding: '15px 0',
  },
  nav: {
    display: 'flex',
    gap: '5px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '15px 15px',
    borderRadius: '4px 4px 0 0',
    transition: 'background-color 0.2s',
  },
  activeLink: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
};

const navItems = [
  { path: '/', label: 'ダッシュボード' },
  { path: '/exercises', label: '種目' },
  { path: '/history', label: '履歴' },
  { path: '/stats', label: '統計' },
  { path: '/plans', label: 'プラン' },
  { path: '/goals', label: '目標' },
];

function Header() {
  const location = useLocation();

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <h1 style={styles.title}>筋トレ記録</h1>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.link,
                ...(location.pathname === item.path ? styles.activeLink : {}),
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
