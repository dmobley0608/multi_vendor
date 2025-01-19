import React from 'react'
import { CiEdit } from 'react-icons/ci'

export default function EditButton({modalId, onClick}) {
    return (
        <span className='btn' title='Edit' onClick={onClick} data-bs-toggle="modal" data-bs-target={modalId}>
            <CiEdit />
        </span>
    )
}
