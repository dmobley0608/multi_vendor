import React from 'react'
import { Outlet } from 'react-router'
import { Col, Container, Row } from 'react-bootstrap'
import EmployeeSidebar from '../../components/EmployeeSidebar'
import './styles.css'
export default function StaffLayout() {
  return (
    <Container fluid className='p-0  ' >
      <Row >
        <Col sm={2} >
          <EmployeeSidebar/>
        </Col>
        <Col sm={10} className=''>
          <Outlet />
        </Col>
      </Row>

    </Container>
  )
}
