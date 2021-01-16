/* eslint-disable no-underscore-dangle */
/* eslint-disable no-alert */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Conversation } from '@mytypes/conversation';
import { Chat as ChatInterface } from '@mytypes/message';
import { useRouter } from 'next/dist/client/router';
import { useAuth } from 'src/contexts/auth';
import { useChat } from 'src/contexts/chat';
import { useConversation } from 'src/contexts/conversation';

import { ModalHandles } from '@components/Modal';

import { useSocket } from '@hooks/socket';

import CreateChatIcon from './assets/chat.svg';
import LogOutIcon from './assets/log-out.svg';
import UserIcon from './assets/user.svg';
import CreateConversationModal from './CreateConversationModal';
import MessageInput from './MessageInput';
import MessagesList from './MessagesList';
import {
  Chat,
  Chats,
  Container,
  Divider,
  LastMessage,
  LeftSide,
  LeftSideContent,
  LeftSideHeader,
  // Message,
  // MessageInfo,
  // MessageInput,
  // MessagesContainer,
  // MessageText,
  // MessageUsername,
  RightSide,
  RightSideHeader,
  RightSideHeaderDivider,
  RightSideHeaderUsername,
  Row,
  SearchInput,
  UserInfo,
  Username,
} from './styles';

const Home: React.FC = () => {
  const router = useRouter();
  const socketConnection = useSocket();

  const authContext = useAuth();
  const { conversations, handleLoadConversations } = useConversation();
  const { chats, handleLoadChat } = useChat();

  const modalRef = useRef<ModalHandles>(null);

  const [selectedConversation, setSelectedConversation] = useState<Conversation>();
  const [selectedChat, setSelectedChat] = useState<ChatInterface>();

  const handleCreateChatIconClick = useCallback(() => {
    modalRef.current.handleOpen();
  }, []);

  const handleLogOutClick = useCallback(() => {
    authContext.signOut();
    router.push('/login');
  }, [authContext, router]);

  const handleConversationClick = useCallback(
    (conversation: Conversation) => {
      setSelectedConversation(conversation);
      const chatExists = chats.find((chat) => chat.conversation._id === conversation._id);

      if (chatExists) {
        return;
      }

      socketConnection.socket.emit('load-chat-request', {
        conversationId: conversation._id,
      });
    },
    [chats, socketConnection.socket]
  );

  useEffect(() => {
    const chat = chats.find((currentChat) => currentChat.conversation._id === selectedConversation?._id);

    setSelectedChat(chat);
  }, [chats, selectedConversation?._id]);

  useEffect(() => {
    // error-channels

    async function startSocketConnection() {
      socketConnection.socket.on('load-conversations', handleLoadConversations);
      socketConnection.socket.on('load-chat', handleLoadChat);

      // const connected = await socketConnection.checkConnection();
      // console.log('connected', connected);

      // if (!connected) {
      //   // [to-do] if is not connected, try to reconnect
      // }
    }

    startSocketConnection();

    // [to-do] remove
    setSelectedConversation(conversations[0]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <CreateConversationModal ref={modalRef} />

      <Container onClick={() => modalRef.current.handleClose()}>
        <LeftSide>
          <LeftSideHeader>
            <UserIcon />
            <CreateChatIcon onClick={handleCreateChatIconClick} />
            <LogOutIcon onClick={handleLogOutClick} />
          </LeftSideHeader>

          <LeftSideContent>
            <SearchInput placeholder="Pesquise por uma conversa" />
            <Divider />

            <Chats>
              {conversations.map((conversation) => (
                <Chat key={conversation._id}>
                  <Row onClick={() => handleConversationClick(conversation)}>
                    <UserIcon />
                    <UserInfo>
                      <Username>{conversation.user.name}</Username>
                      {conversation.lastMessage && <LastMessage>{conversation.lastMessage?.text}</LastMessage>}
                    </UserInfo>
                  </Row>

                  <Divider />
                </Chat>
              ))}
            </Chats>
          </LeftSideContent>
        </LeftSide>

        <RightSide visible={selectedConversation !== undefined}>
          <RightSideHeader>
            <RightSideHeaderDivider />
            <RightSideHeaderUsername>{selectedConversation?.user?.name}</RightSideHeaderUsername>
          </RightSideHeader>

          <MessagesList chat={selectedChat} />

          <MessageInput
            placeholder="Escreva sua mensagem"
            handleSubmit={(value) => {
              console.log(value);
            }}
          />
        </RightSide>
      </Container>
    </>
  );
};

export default Home;
