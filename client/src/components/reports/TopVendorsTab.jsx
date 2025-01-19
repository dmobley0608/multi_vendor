import React, { useEffect, useState } from 'react';
import { useGetTopVendorsQuery } from '../../services/TransactionApi';
import { Table, Tabs, Tab } from 'react-bootstrap';
import './TopVendorsTab.css'; // Import the CSS file for custom styles

const TopVendorsTab = () => {
  const { data: topVendors, error, isLoading } = useGetTopVendorsQuery();
  const [activeKey, setActiveKey] = useState('week');

  useEffect(() => {
    console.log('vendors', topVendors);
  }, [topVendors]);

  const renderTable = (vendors, title) => (
    <div>
      <h4>{title}</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Items Sold</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {vendors?.map((vendor) => (
            <tr key={vendor.vendor_item__vendor__id}>
              <td>{vendor.vendor_item__vendor__store_name}</td>
              <td>{vendor.itemsSold}</td>
              <td>${(vendor.totalAmount / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  return (
    <div>
      <h2 className="top-vendors-title">Top 10's</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading top vendors</p>}
      {topVendors && Object.keys(topVendors).length > 0 ? (
        <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k)} id="top-vendors-tabs">
          <Tab eventKey="week" title="This Week">
            {renderTable(topVendors.week, '')}
          </Tab>
          <Tab eventKey="month" title="This Month">
            {renderTable(topVendors.month, '')}
          </Tab>
          <Tab eventKey="year" title="This Year">
            {renderTable(topVendors.year, '')}
          </Tab>
        </Tabs>
      ) : (
        <p>No top vendors data available</p>
      )}
    </div>
  );
};

export default TopVendorsTab;
