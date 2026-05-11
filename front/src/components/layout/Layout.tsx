import { Outlet } from 'react-router-dom';
import { AppShell, Box } from '@mantine/core';

import { Header } from '../Header';

export function Layout() {
  return (
    <AppShell header={{ height: 64 }} padding={0}>
      <AppShell.Header withBorder>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        <Box maw={1100} mx="auto" px="lg" py="xl">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
