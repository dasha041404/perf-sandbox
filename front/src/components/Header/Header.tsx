import { NavLink } from 'react-router-dom';
import { Group, Text } from '@mantine/core';
import { IconCode } from '@tabler/icons-react';

import { ROUTES } from '../../config/routes';

const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  color: isActive ? 'var(--mantine-color-white)' : 'var(--mantine-color-dimmed)',
  textDecoration: 'none',
  fontWeight: 500,
});

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
        <NavLink to={ROUTES.SANDBOX} style={linkStyle}>
          Sandbox
        </NavLink>
        <NavLink to={ROUTES.RESULTS} style={linkStyle}>
          Results
        </NavLink>
      </Group>
    </Group>
  );
}
