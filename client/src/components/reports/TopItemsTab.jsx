import React, { useEffect, useState } from 'react';
import { useGetTopItemsQuery } from '../../services/TransactionApi';
import { Table, Tabs, Tab } from 'react-bootstrap';
import './TopItemsTab.css'; // Import the CSS file for custom styles

const TopItemsTab = () => {
  const { data: topItems, error, isLoading } = useGetTopItemsQuery();
  const [activeKey, setActiveKey] = useState('week');

  useEffect(() => {
    console.log('items', topItems);
  }, [topItems]);

  const renderTable = (items, title) => (
    <div>
      <h4>{title}</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Item</th>
            <th>Items Sold</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item) => (
            <tr key={item.vendor_item__id}>
              <td>{item.vendor_item__name}</td>
              <td>{item.itemsSold}</td>
              <td>${(item.totalAmount / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  return (
    <div>
      <h2 className="top-items-title">Top 10 Items</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading top items</p>}
      {topItems && Object.keys(topItems).length > 0 ? (
        <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k)} id="top-items-tabs">
          <Tab eventKey="week" title="This Week">
            {renderTable(topItems.week, 'Top Items This Week')}
          </Tab>
          <Tab eventKey="month" title="This Month">
            {renderTable(topItems.month, 'Top Items This Month')}
          </Tab>
          <Tab eventKey="year" title="This Year">
            {renderTable(topItems.year, 'Top Items This Year')}
          </Tab>
        </Tabs>
      ) : (
        <p>No top items data available</p>
      )}
    </div>
  );
};

export default TopItemsTab;
