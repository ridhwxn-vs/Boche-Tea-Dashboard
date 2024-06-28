import React from 'react';
import './header.css'; // Import the CSS file for header styling

const Header = () => {
    const handleScrollToWelcome = () => {
        const welcomeSection = document.getElementById('welcome-section');
        if (welcomeSection) {
          welcomeSection.scrollIntoView({ behavior: 'smooth' });
        }
      };
    const handleScrollToSales = () => {
        const saleSection = document.getElementById('sales-section');
        if (saleSection) {
          saleSection.scrollIntoView({ behavior: 'smooth' });
        }
      };
    return (
        <header className="header">
            <div className="header-top">
                <h1 className='analytic-title'>Analytics Dashboard</h1>
            </div>
            <div className="header-bottom">
                <a href="#" onClick={handleScrollToWelcome}>Home</a>
                <a href="#" onClick={handleScrollToSales}>Sales Stats</a>
                <a href="#">User Stats</a>
                <a href="#">Geography Stats</a>
            </div>
        </header>
    );
};

export default Header;
