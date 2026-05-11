import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Code,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { useExperiments } from '../../hooks/useExperiments';
import { buildHeatmap, truncate } from '../../lib/heatmap';
import { Heatmap } from './Heatmap';

export function ResultsPage() {
  const { items, loading, error, refetch } = useExperiments();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [showHeat, setShowHeat] = useState(false);

  const visible = useMemo(() => items.filter((it) => !hidden.has(it.id)), [items, hidden]);
  const allSelected = visible.length > 0 && visible.every((it) => selected.has(it.id));
  const someSelected = !allSelected && visible.some((it) => selected.has(it.id));

  const selectedItems = useMemo(
    () => visible.filter((it) => selected.has(it.id)),
    [visible, selected],
  );

  const heatmapModel = useMemo(
    () => buildHeatmap(selectedItems.length > 0 ? selectedItems : visible),
    [selectedItems, visible],
  );

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible.map((it) => it.id)));
    }
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Results</Title>
        <Button variant="subtle" onClick={() => void refetch()} disabled={loading}>
          Refresh
        </Button>
      </Group>

      {error && (
        <Alert color="red" title="Failed to load experiments">
          {error}
        </Alert>
      )}

      <Card withBorder padding={0}>
        {visible.length > 0 && (
          <Group justify="space-between" px="md" py="sm">
            <Checkbox
              label="Select all"
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
            />
            {selected.size > 0 && (
              <Group gap="sm">
                <Button onClick={() => setShowHeat(true)}>Build Heatmap</Button>
                <Button variant="default" onClick={() => setSelected(new Set())}>
                  Clear selection
                </Button>
              </Group>
            )}
          </Group>
        )}

        {loading && visible.length === 0 ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : visible.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed">No results yet. Run an experiment to see data here.</Text>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={36} />
                  <Table.Th>ENGINE</Table.Th>
                  <Table.Th>INPUT</Table.Th>
                  <Table.Th>OUTPUT</Table.Th>
                  <Table.Th>EXECUTION TIME</Table.Th>
                  <Table.Th>DATE</Table.Th>
                  <Table.Th w={48} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {visible.map((it) => (
                  <Table.Tr key={it.id}>
                    <Table.Td>
                      <Checkbox
                        checked={selected.has(it.id)}
                        onChange={() => toggleOne(it.id)}
                        aria-label={`select row ${it.id}`}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600}>{it.engine}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label={it.input_template} multiline maw={400} withArrow>
                        <Code>{truncate(it.input_template, 28)}</Code>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label={it.output} multiline maw={400} withArrow>
                        <Code>{truncate(it.output, 28)}</Code>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td>
                      <Text ff="monospace">{(it.execution_time * 1000).toFixed(2)} ms</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text c="dimmed" size="sm">
                        {it.data}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label="Hidden locally (backend has no delete endpoint)" withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() =>
                            setHidden((prev) => {
                              const next = new Set(prev);
                              next.add(it.id);
                              return next;
                            })
                          }
                          aria-label={`hide row ${it.id}`}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      {showHeat && heatmapModel.engines.length > 0 && (
        <Heatmap model={heatmapModel} onHide={() => setShowHeat(false)} />
      )}

      {hidden.size > 0 && (
        <Box>
          <Button variant="subtle" size="xs" onClick={() => setHidden(new Set())}>
            Restore {hidden.size} hidden row(s)
          </Button>
        </Box>
      )}
    </Stack>
  );
}
