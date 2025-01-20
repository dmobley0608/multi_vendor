import React from 'react'
import { useGetMessagesQuery } from '../../services/MessageApi'
import { useGetUserQuery } from '../../services/Api'
import { Badge, Spinner } from 'react-bootstrap'

export default function UnreadMessageBadge() {
      const { data: messages, isLoading: isMessagesLoading } = useGetMessagesQuery()
      const {data:user, isLoading:isUserLoading} = useGetUserQuery()


      if(isMessagesLoading || isUserLoading) return <Spinner animation='border' variant='primary' size='sm' />;
        const inboxMessages =messages?.results?.filter((msg) => msg.recipients.some(recipient => recipient.id === user.id));
        const unreadMessagesCount = inboxMessages?.filter((msg) => !msg.is_read).length;
  return (
    <Badge bg='secondary'>
        {unreadMessagesCount > 0 && `${unreadMessagesCount}`}
    </Badge>
  )
}
