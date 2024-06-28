import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './sales.css';
import { parse, isValid } from 'date-fns';
import SalesData from './tiletemplate';

const SalesTile = ({ selectedDates , setTotalSalesSum, setPacketsSoldSum }) => {
  const [totalSales, setTotalSales] = useState(0);
  const [packetsSold, setPacketsSold] = useState(0);


  useEffect(() => {
    const fetchData = async () => {
      if (selectedDates.startDate && selectedDates.endDate) {
        console.log('Loading data...');
        console.log('Selected Dates:', selectedDates);

        try {
          const csvFilePath = '/data/TransactionsSample.csv';
          const response = await fetch(csvFilePath);
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');

          let csvString = '';
          let totalSalesSum = 0;

          const processChunk = async ({ done, value }) => {
            if (done) {
              // Finalize parsing
              Papa.parse(csvString, {
                header: true,
                complete: (results) => {
                  processParsedData(results.data);
                }
              });
              return;
            }

            csvString += decoder.decode(value, { stream: true });
            await reader.read().then(processChunk);
          };

          const processParsedData = (data) => {
            const startDate = new Date(selectedDates.startDate);
            const endDate = new Date(selectedDates.endDate);

            const filteredData = data.filter((row) => {
              if (!row.trans_date) {
                console.log('Missing trans_date in row:', row);
                return false;
              }

              const rawDateString = row.trans_date.trim();
              let transType=row.trans_type_id.trim();
              let transactionDate = parse(rawDateString, 'M/d/yyyy h:mm:ss a', new Date());
              if (!isValid(transactionDate)) {
                transactionDate = new Date(rawDateString);
              }

              const isInRange = transactionDate >= startDate && transactionDate <= endDate && transType==1;
              return isInRange;
            });

            console.log('Filtered data Length:', filteredData.length);

            filteredData.forEach((row) => {
              const transAmount = parseFloat(row.trans_amt);
              if (!isNaN(transAmount)) {
                totalSalesSum += transAmount;
              }
            });

            const packetsSoldSum = totalSalesSum / 40;

            console.log('Total Sales Sum:', totalSalesSum);
            console.log('Packets Sold Sum:', packetsSoldSum);

            setTotalSales(`₹${totalSalesSum.toFixed(2)}`);
            setPacketsSold(packetsSoldSum);
            setTotalSalesSum(totalSalesSum.toFixed(2)); 
            setPacketsSoldSum(packetsSoldSum);
            console.log('Data processed successfully');
          };

          await reader.read().then(processChunk);
        } catch (error) {
          console.error('Error fetching and parsing CSV:', error);
        }
      }
    };

    fetchData();
  },  [selectedDates, setPacketsSoldSum, setTotalSalesSum]);

  return (
    <section id="sales-tile">
      <h2 className="sales-title">Sales Figures</h2>
      <div className="sales-container">
        <SalesData title="Total Sales" value={totalSales} />
        <SalesData title="Packets Sold" value={packetsSold.toFixed(0)} />
      </div>
    </section>
  );
};

export default SalesTile;
