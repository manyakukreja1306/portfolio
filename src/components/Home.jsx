import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import About from './About';
import Projects from './Projects';
import Contact from './Contact';
import Footer from './Footer';

function Home() {
  return (
    <div>
      <Header />
      <main>
        <About />
        <Projects />
        <Contact />
        <div style={{ margin: '20px', textAlign: 'center' }}>
          <Link to="/other" style={{ fontSize: '18px', textDecoration: 'underline', color: 'blue' }}>
            Go to Other Page
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
