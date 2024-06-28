import React, { useEffect, useState } from 'react';
import './playerdetails.css';
import SalesData from './tiletemplate';
import Papa from 'papaparse';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { isValid } from 'date-fns';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PlayerDetails = ({ startDate, endDate, packetsSoldSum,setUserPurchaseCount}) => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [loyalCustomers, setLoyalCustomers] = useState(0);
  

  useEffect(() => {
    const fetchUsers = async () => {
      return new Promise((resolve, reject) => {
        const userPurchaseCount = {};
        const masterData = new Set();

        // Parsing MasterSample.csv
        Papa.parse('/data/MasterSample.csv', {
          download: true,
          header: true,
          chunk: (results) => {
            const chunkData = results.data;
            chunkData.forEach((row) => {
              const createdOn = new Date(row.created_on);
              if (!isValid(createdOn)) {
                console.warn(`Invalid date format for Created_on: ${row.created_on}`);
                return;
              }
              if (createdOn >= new Date(startDate) && createdOn <= new Date(endDate)) {
                masterData.add(row.player_id);
              }
            });
          },
          complete: () => {
            // Parsing TransactionsSample.csv
            Papa.parse('/data/TransactionsSample.csv', {
              download: true,
              header: true,
              chunk: (results) => {
                const chunkData = results.data;
                chunkData.forEach((row) => {
                  const transactionDate = new Date(row.trans_date);
                  if (!isValid(transactionDate)) {
                    console.warn(`Invalid date format for trans_date: ${row.trans_date}`);
                    return;
                  }
                  if (transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate)) {
                    const playerId = row.player_id;
                    if (row.trans_type_id == 1) { // Assuming 1 is the transaction type for 'Entry'
                      const packets = parseInt(row.trans_amt, 10) / 40;
                      if (userPurchaseCount[playerId]) {
                        userPurchaseCount[playerId] += packets;
                      } else {
                        userPurchaseCount[playerId] = packets;
                      }
                    }
                  }
                });
              },
              complete: () => {
                const totalUsersCount = Object.keys(userPurchaseCount).length;
                const loyalCustomersCount = Object.values(userPurchaseCount).filter(count => count > 25).length;
                const newUsersCount = Object.keys(userPurchaseCount).filter(playerId => masterData.has(playerId)).length;
                setUserPurchaseCount(userPurchaseCount);

                resolve({ totalUsersCount, newUsersCount, loyalCustomersCount });
              },
              error: (error) => {
                reject(error);
              }
            });
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    };

    const fetchData = async () => {
      if (startDate && endDate) {
        try {
          const { totalUsersCount, newUsersCount, loyalCustomersCount } = await fetchUsers();
          setTotalUsers(totalUsersCount);
          setNewUsers(newUsersCount);
          setLoyalCustomers(loyalCustomersCount);

        } catch (error) {
          console.error('Error fetching and parsing CSV:', error);
        }
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const barData = {
    labels: ['New Users', 'Exisiting Customers'],
    datasets: [
      {
        label: 'Users',
        data: [newUsers, totalUsers-newUsers],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const packetsPerCustomer = totalUsers > 0 ? (packetsSoldSum / totalUsers).toFixed(2) : 0;

  return (
    <section id="player-details">
      <h2 className="player-title">Player Analytics</h2>
      <div className="player-container">
        <SalesData title="Total Users" value={totalUsers} width="250px" />
        <SalesData title="New Users" value={newUsers} width="250px" />
        <SalesData title="Loyal Customers" value={loyalCustomers} width="250px" />
      </div>
      <div className="player-container">
        <div className="bar-graph">
          <Bar data={barData} options={{ maintainAspectRatio: false }} />
        </div>
        <div className="tile-temp custom-tile">
          <p className="data-value">{packetsPerCustomer}</p>
          <p className="packets-text">Packets</p>
          <p className="average-text">bought per customer on average</p>
        </div>
      </div>
    </section>
  );
};

export default PlayerDetails;
