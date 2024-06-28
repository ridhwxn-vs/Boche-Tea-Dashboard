import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import './salestrend.css';
import './sales.css';

const SalesTrend = () => {
  const [monthlySales, setMonthlySales] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const csvFilePath = '/data/TransactionsSample.csv';
        const response = await fetch(csvFilePath);
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        let csvString = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          csvString += decoder.decode(value, { stream: true });
        }

        const parsed = Papa.parse(csvString, { header: true });
        console.log('Data Loaded..');

        const currentYear = new Date().getFullYear();
        const monthlySalesData = Array(12).fill(0);

        parsed.data.forEach((row) => {
          if (!row.trans_date) return;

          const rawDateString = row.trans_date.trim();
          const transactionDate = new Date(rawDateString);

          if (transactionDate.getFullYear() === currentYear) {
            const month = transactionDate.getMonth();
            const transAmount = parseFloat(row.trans_amt);
            if (!isNaN(transAmount)) {
              monthlySalesData[month] += transAmount;
            }
          }
        });

        const formattedMonthlySales = monthlySalesData.map((sales, index) => ({
          month: new Date(0, index).toLocaleString('default', { month: 'long' }),
          packetsSold: sales / 40,
        }));

        setMonthlySales(formattedMonthlySales);
        console.log('Monthly Sales Data:', formattedMonthlySales);
        console.log('Data processed successfully');
      } catch (error) {
        console.error('Error fetching and parsing CSV:', error);
      }
    };

    fetchData();
  }, []);

  const maxPacketsSold = Math.max(...monthlySales.map(data => data.packetsSold));
  const yAxisMax = Math.ceil(maxPacketsSold / 5000) * 5000;

  return (
    <section id="sales-trend">
      <h2 className="sales-title">Sales Trend</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlySales}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" />
            <YAxis domain={[0, yAxisMax]} />
            <Tooltip />
            <Line type="monotone" dataKey="packetsSold" stroke="#346f32" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p style={{ textAlign: 'center',color:'#333', fontFamily:'Ubuntu, sans-serif', fontSize: '20px' }}>Packets Sales Monthwise</p>
    </section>
  );
};

export default SalesTrend;
