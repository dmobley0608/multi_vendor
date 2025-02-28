import React from 'react'
import { MdDeleteForever } from 'react-icons/md'

export default function DeleteButton({onClick}) {
  return (
    <span className='btn icon-font-size' title='Delete' onClick={onClick}><MdDeleteForever/></span>
  )
}
