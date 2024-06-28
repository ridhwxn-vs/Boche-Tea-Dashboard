import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import './welcome.css'; 

const Welcome = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState(new Date()); 
  const [endDate, setEndDate] = useState(new Date());

  const handleButtonClick = () => {
    console.log('Button clicked with dates:', { startDate, endDate });
    onDateChange(startDate, endDate);
  };

  return (
    <div className="welcome-container">
      <img src="/WelcomeImage.png" alt="Welcome" className="welcome-image" />
      <div className="welcome-details">
        <h2 className="welcome-head">Welcome to Analytics Dashboard</h2>
        <p className='para-text'>Please choose a date range to display analytics for the selected dates. You can also click on each analytic to access more detailed information.</p>
        <div className="date-picker">
        <label className='from-to-text'>From :</label>
          <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select start date"
            />
        </div>
        <div className="date-picker">
          <label className='from-to-text'>To :</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select end date"
            />
        </div>
        <button onClick={handleButtonClick}>Show Analytics</button>
      </div>
    </div>
  );
};

export default Welcome;
