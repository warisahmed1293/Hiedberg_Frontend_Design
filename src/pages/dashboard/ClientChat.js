import { useEffect } from 'react';
// @mui
import { Card, Container } from '@mui/material';
// redux
import { useDispatch } from '../../redux/store';
import { getConversations, getContacts } from '../../redux/slices/chat';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { ClientChatSidebar, ClientChatWindow } from '../../sections/@dashboard/chat';

// ----------------------------------------------------------------------

export default function ClientChat() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getConversations());
    dispatch(getContacts());
  }, [dispatch]);

  return (
    <Page title="Chat">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="Chat"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.general.clientApp }, { name: 'Chat' }]}
        />
        <Card sx={{ height: '72vh', display: 'flex' }}>
          <ClientChatSidebar />
          <ClientChatWindow />
        </Card>
      </Container>
    </Page>
  );
}
