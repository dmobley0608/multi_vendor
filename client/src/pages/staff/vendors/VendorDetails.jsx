import React from 'react'
import { Col, Container, Nav, Row, Stack, Tab, Table } from 'react-bootstrap'
import { useParams } from 'react-router'
import {  useGetVendorByIdQuery } from '../../../services/Api'

import VendorPaymentsTable from '../../../components/tables/VendorPaymentsTable'
import VendorItemTable from '../../../components/tables/VendorItemTable'

export default function VendorDetails() {
  const { id } = useParams()
  const { data: vendor, isLoading, error } = useGetVendorByIdQuery(id)





  return (
    <>
      {
        isLoading ? <p>Loading...</p> :
          <Container>
            <Row>
              <Col>
                <h1>{vendor?.store_name ?? vendor?.name}</h1>
              </Col>
            </Row>
            <Row>
              <Col sm={12} md={6}>
                <Stack gap={1} className='text-start'>
                  <h6>Contact Information</h6>
                  <p className='m-0'>Name: {vendor?.user.name}</p>
                  <p className='m-0'>Phone: {vendor?.user.phone_number}</p>
                  <p className='m-0'>Email: {vendor?.user.email}</p>
                  <p className='m-0'>Address: <br />{vendor?.street_address} <br />{vendor?.city} {vendor?.state} {vendor?.postal_code}</p>
                  <p></p>
                </Stack>
              </Col>
              <Col sm={12} md={6}>
                <Stack gap={1} className='text-start'>
                  <h6>Sales Breakdown</h6>
                  <p className='m-0'>Current Balance: ${vendor?.balance > 0 ? (vendor.balance / 100).toFixed(2) : '0.00'}</p>
                  <p className='m-0'>YTD Sales: ${(vendor?.ytd_sales / 100).toFixed(2)}</p>
                </Stack>
              </Col>
            </Row>
            <Row>
            <Col>
              <Tab.Container id="vendor-details-tabs" defaultActiveKey="items">
                <Nav variant="tabs" background="bg-light">
                  <Nav.Item>
                    <Nav.Link eventKey="items">Items</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="payments">Payments</Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content >
                  <Tab.Pane eventKey="items" >
                    <VendorItemTable items={vendor?.items ?? []} vendor={vendor} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="payments">
                    <VendorPaymentsTable payments={vendor?.payments ?? [] }vendor={vendor} />
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Col>
          </Row>

          </Container>
      }
    </>
  )
}
