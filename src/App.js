import React, { useState } from 'react';
import Header from './components/header';
import Welcome from './components/welcome';
import SalesTile from './components/sales.js';
import SalesTrend from './components/salestrend.js';
import PlayerDetails from './components/playerdetails.js';
import Geotrend from './components/geotrend.js';
import './App.css';

const App = () => {
  const [selectedDates, setSelectedDates] = useState({ startDate: null, endDate: null });
  const [packetsSoldSum, setPacketsSoldSum] = useState(0);
  const [totalSalesSum, setTotalSalesSum] = useState(0);
  const [userPurchaseCount, setUserPurchaseCount] = useState({});

  const handleDateChange = (startDate, endDate) => {
    setSelectedDates({ startDate, endDate });
  };

  const handleSalesDataChange = (salesData) => {
    setPacketsSoldSum(salesData.packetsSoldSum);
    setTotalSalesSum(salesData.totalSalesSum);
  };

  return (
    <div className="App">
      
      <main>
        <section id="welcome-section">
          <Welcome onDateChange={handleDateChange} />
        </section>
        <section id="sales-section">
          <SalesTile selectedDates={selectedDates}
        setPacketsSoldSum={setPacketsSoldSum}
        setTotalSalesSum={setTotalSalesSum} />
        </section>
        <section id="sales-trend-section"> 
          <SalesTrend />
        </section>
        <section id="player-details-section"> 
          <PlayerDetails startDate={selectedDates.startDate} endDate={selectedDates.endDate} packetsSoldSum={packetsSoldSum} setUserPurchaseCount={setUserPurchaseCount} />
        </section>
        <section id="geo-analytics-section"> 
          <Geotrend userPurchaseCount={userPurchaseCount} />
        </section>
      </main>
    </div>
  );
};

export default App;
