import React from 'react';
import PropTypes from 'prop-types';

const SalesData = ({ title, value, width }) => {
  return (
    <div className="tile-temp" style={{ width: width }}>
      <h3 className="data-title">{title}</h3>
      <p className="data-value">{value}</p>
    </div>
  );
};

SalesData.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  width: PropTypes.string
};

SalesData.defaultProps = {
  width: '400px'
};

export default SalesData;
