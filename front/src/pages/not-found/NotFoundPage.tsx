import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

import { ROUTES } from '../../config/routes';

export function NotFoundPage() {
  return (
    <Center py="xl">
      <Stack align="center" gap="md">
        <Title order={2}>404</Title>
        <Text c="dimmed">The page you’re looking for doesn’t exist.</Text>
        <Button component={Link} to={ROUTES.SANDBOX}>
          Go to Sandbox
        </Button>
      </Stack>
    </Center>
  );
}
