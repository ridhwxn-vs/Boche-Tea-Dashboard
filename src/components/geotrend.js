import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import './geotrend.css';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import keralaDistrictsGeoJson from './keralaDistrictsGeoJson.json';
import * as echarts from 'echarts';

const Geotrend = ({ userPurchaseCount }) => {
  const [topDistrict, setTopDistrict] = useState('');
  const [topDistrictPackets, setTopDistrictPackets] = useState(0);
  const [topDistrictSales, setTopDistrictSales] = useState(0);
  const [districtSalesData, setDistrictSalesData] = useState({ labels: [], datasets: [] });
  const [stateSalesData, setStateSalesData] = useState({ labels: [], datasets: [] });
  const [districtSales, setDistrictSales] = useState({});
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedDistrictSales, setSelectedDistrictSales] = useState(0);

  useEffect(() => {
    if (Object.keys(userPurchaseCount).length > 0) {
      fetchDistrictData(userPurchaseCount);
    }
  }, [userPurchaseCount]);

  const fetchDistrictData = (userPurchaseCount) => {
    Papa.parse('/data/MasterSample.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const data = results.data;
        const stateSales = {};
        const districtSales = {};

        data.forEach((row) => {
          const playerId = row.player_id;
          const state = row.state_name;
          const district = row.region_name;

          if (userPurchaseCount[playerId]) {
            const packets = userPurchaseCount[playerId];

            if (state) {
              if (stateSales[state]) {
                stateSales[state] += packets;
              } else {
                stateSales[state] = packets;
              }
            }

            if (state == 'Kerala' && district) {
              if (districtSales[district]) {
                districtSales[district] += packets;
              } else {
                districtSales[district] = packets;
              }
            }
          }
        });

        const allDistricts = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'];
        allDistricts.forEach(district => {
          if (!districtSales[district]) {
            districtSales[district] = 0;
          }
        });

        setDistrictSales(districtSales);

        const topDistrict = Object.keys(districtSales).reduce((a, b) => (districtSales[a] > districtSales[b] ? a : b), '');
        const topDistrictPackets = districtSales[topDistrict] || 0;
        const topDistrictSales = topDistrictPackets * 40;

        setTopDistrict(topDistrict);
        setTopDistrictPackets(topDistrictPackets.toFixed(0));
        setTopDistrictSales(topDistrictSales.toFixed(2));

        const labels = Object.keys(districtSales);
        const dataValues = Object.values(districtSales);
        setDistrictSalesData({
          labels: labels,
          datasets: [
            {
              data: dataValues,
              backgroundColor: labels.map(() => `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`),
              borderColor: labels.map(() => `rgba(255, 255, 255, 1)`),
              borderWidth: 1,
            },
          ],
        });

        const stateLabels = Object.keys(stateSales);
        const stateDataValues = Object.values(stateSales);
        setStateSalesData({
          labels: stateLabels,
          datasets: [
            {
              data: stateDataValues,
              backgroundColor: stateLabels.map(() => `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`),
              borderColor: stateLabels.map(() => `rgba(255, 255, 255, 1)`),
              borderWidth: 1,
            },
          ],
        });
      },
      error: (error) => {
        console.error('Error fetching district data:', error);
      },
    });
  };

  const getColor = (d) => {
    return d > 1000 ? '#800026' :
      d > 500 ? '#BD0026' :
        d > 200 ? '#E31A1C' :
          d > 100 ? '#FC4E2A' :
            d > 50 ? '#FD8D3C' :
              d > 20 ? '#FEB24C' :
                d > 10 ? '#FED976' :
                  '#FFEDA0';
  };

  const style = (feature) => {
    const districtName = feature.properties.DISTRICT;
    const sales = districtSales[districtName] || 0;
    return {
      fillColor: getColor(sales),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        const districtName = feature.properties.DISTRICT;
        const sales = districtSales[districtName] || 0;
        setSelectedDistrict(districtName);
        setSelectedDistrictSales(sales);
      }
    });
  };

  const initECharts = useCallback(() => {
    requestAnimationFrame(() => {
      const chartDom = document.getElementById('stateSalesChart');
      if (!chartDom) return;
      let myChart = echarts.getInstanceByDom(chartDom);
      if (myChart) {
        myChart.dispose();
      }
      myChart = echarts.init(chartDom);
      const stateLabels = stateSalesData.labels;
      const stateDataValues = stateSalesData.datasets[0].data;

      const option = {
        backgroundColor: '#f2fff1',
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'center'
        },
        series: [
          {
            name: 'State-wise Sales',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            maxAngle: 90,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: stateLabels.map((label, index) => ({
              value: Math.ceil(stateDataValues[index]),
              name: label
            }))
          }
        ]
      };

      myChart.setOption(option);
    });
  }, [stateSalesData]);

  useEffect(() => {
    if (stateSalesData.labels.length > 0) {
      initECharts();
    }
  }, [stateSalesData, initECharts]);

  return (
    <section id="geotrend-tile">
      <h2 className="geotrend-title">Geographic Data</h2>
      <div className="geotrend-container">
        <div className="tile-temp-geo">
          <p className="dist-title">Top Selling District - Kerala</p>
          <p className="dist-value">{topDistrict}</p>
        </div>
        <div className="tile-temp-geo">
          <p className="data-value-geo">{topDistrictPackets}</p>
          <p className="data-title-geo">Packets Sold</p>
        </div>
        <div className="tile-temp-geo">
          <p className="data-value-geo">₹{topDistrictSales}</p>
          <p className="data-title-geo">Total Sales</p>
        </div>
      </div>
      <div className="geotrend-container">
        <MapContainer style={{ height: '500px', width: '100%' }} center={[10.8505, 76.2711]} zoom={7}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          <GeoJSON data={keralaDistrictsGeoJson} style={style} onEachFeature={onEachFeature} />
        </MapContainer>
        <div>
          <h2 className="hm-title">District Sales Heatmap</h2>
          {selectedDistrict && (
            <div>
              <div className="tile-temp-geo-hm">
                <p className="dist-title-hm">Selected District</p>
                <p className="dist-value-hm">{selectedDistrict}</p>
              </div>
              <div className="tile-temp-geo-hm">
                <p className="data-value-geo-hm">{Math.ceil(selectedDistrictSales)}</p>
                <p className="data-title-geo-hm">Packets Sold</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="geotrend-container-epie">
      <h2 className="hm-title">State-wise Sales</h2>
          <div id="stateSalesChart" className="charts-container" style={{ height: '400px' }}></div>
      </div>
    </section>
  );
};

export default Geotrend;
