import React, { useState } from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import TransactionsTab from '../../../components/reports/TransactionsTab';
import TopVendorsTab from '../../../components/reports/TopVendorsTab';
import TopItemsTab from '../../../components/reports/TopItemsTab';
import MonthlyReport from '../../../components/reports/MonthlyReport';

const Reports = () => {
  const [key, setKey] = useState('transactions');

  return (
    <Container className='mt-3'>
      <Tabs activeKey={key} onSelect={(k) => setKey(k)}>
        <Tab eventKey="transactions" title="Transactions">
          <TransactionsTab />
        </Tab>
        <Tab eventKey="topVendors" title="Top Vendors">
          <TopVendorsTab />
        </Tab>
        <Tab eventKey="topItems" title="Top Items">
          <TopItemsTab />
        </Tab>
        <Tab eventKey="monthly-report" title="Monthly Report">
          <MonthlyReport />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Reports;
