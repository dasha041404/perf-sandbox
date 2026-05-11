import { NavLink } from 'react-router-dom';
import { Anchor, Group, Text } from '@mantine/core';
import { IconCode } from '@tabler/icons-react';

import { ROUTES } from '../../config/routes';

export function Header() {
  return (
    <Group h="100%" px="xl" justify="space-between" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        <IconCode size={22} stroke={2} />
        <Text fw={600} size="lg">
          Template Engine Performance Sandbox
        </Text>
      </Group>

      <Group gap="lg" wrap="nowrap">
        <Anchor
          component={NavLink}
          to={ROUTES.SANDBOX}
          underline="never"
          c="white"
          fw={500}
          // active styling via inline render prop
          style={({ isActive }: { isActive: boolean }) => ({
            color: isActive ? 'var(--mantine-color-white)' : 'var(--mantine-color-dimmed)',
          })}
        >
          Sandbox
        </Anchor>
        <Anchor
          component={NavLink}
          to={ROUTES.RESULTS}
          underline="never"
          fw={500}
          style={({ isActive }: { isActive: boolean }) => ({
            color: isActive ? 'var(--mantine-color-white)' : 'var(--mantine-color-dimmed)',
          })}
        >
          Results
        </Anchor>
      </Group>
    </Group>
  );
}
