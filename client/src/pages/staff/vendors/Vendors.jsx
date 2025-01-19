import React, { useEffect, useState } from 'react'
import { useDeleteVendorMutation, useGetVendorsQuery } from '../../../services/VendorApi'
import { Button, Col, Modal, Row, Stack, Table } from 'react-bootstrap'
import { Link } from 'react-router'
import AddVendorForm from '../../../components/forms/vendor/AddVendorForm'
import Swal from 'sweetalert2'
import { CiDollar, CiEdit } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import AddVendorPaymentForm from '../../../components/forms/vendor/AddVendorPaymentForm'
import EditButton from '../../../components/EditButton'
import AddPaymentButton from '../../../components/AddPaymentButton'
import DeleteButton from '../../../components/DeleteButton'
import VendorListTable from '../../../components/tables/VendorListTable'

export default function Vendors() {

  return (
    <>
      <Stack className='p-3'>
        <VendorListTable/>
      </Stack>


    </>

  )
}
