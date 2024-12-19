import React from 'react';
import { Link } from 'react-router-dom';

function OtherPage() {
  return (
    <div>
      <h1>Other Page</h1>
      <p>This is another webpage you navigated to.</p>
      <div style={{ margin: '20px', textAlign: 'center' }}>
        <Link to="/" style={{ fontSize: '18px', textDecoration: 'underline', color: 'blue' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default OtherPage;
