import React, { useState } from 'react'
import { Table, Pagination } from 'react-bootstrap'
import { useGetVendorByIdQuery, useGetVendorByUserQuery } from '../../services/Api'

export default function VendorPayments() {
  const { data: vendorData } = useGetVendorByUserQuery() 
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  if (!vendorData) return null

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentPayments = vendorData.payments.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <>
      <h3 style={{ color: 'black' }}>Payments</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {currentPayments.map((payment, index) => (
            <tr key={index}>
              <td>${(payment.amount / 100).toFixed(2)}</td>
              <td>{payment.date}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination>
        {Array.from({ length: Math.ceil(vendorData.payments.length / itemsPerPage) }, (_, index) => (
          <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => handlePageChange(index + 1)}>
            {index + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </>
  )
}
