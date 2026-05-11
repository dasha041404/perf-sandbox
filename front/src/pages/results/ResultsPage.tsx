import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Center,
  Checkbox,
  Code,
  Group,
  Loader,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';

import { useExperiments } from '../../hooks/useExperiments';
import { buildHeatmap, truncate } from '../../lib/heatmap';
import { deleteExperiment } from '../../services/experiments-service';
import { Heatmap } from './Heatmap';

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];
const DEFAULT_PAGE_SIZE = 20;

export function ResultsPage() {
  const { items, loading, error, refetch } = useExperiments();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showHeat, setShowHeat] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // Clamp the page locally during render — avoids cascading setState in effects.
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const allOnPageSelected = pageItems.length > 0 && pageItems.every((it) => selected.has(it.id));
  const someOnPageSelected = !allOnPageSelected && pageItems.some((it) => selected.has(it.id));

  const selectedItems = useMemo(() => items.filter((it) => selected.has(it.id)), [items, selected]);

  const heatmapModel = useMemo(() => buildHeatmap(selectedItems), [selectedItems]);

  // Heatmap is only visible while the user has at least one row selected.
  // Deselecting the last row automatically hides it without needing an effect.
  const heatmapVisible = showHeat && selectedItems.length > 0;

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        for (const it of pageItems) next.delete(it.id);
      } else {
        for (const it of pageItems) next.add(it.id);
      }
      return next;
    });
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    setShowHeat(false);
  }

  async function handleDelete(id: number) {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    try {
      await deleteExperiment(id);
      setSelected((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await refetch();
    } catch (e) {
      notifications.show({
        title: 'Failed to delete experiment',
        message: e instanceof Error ? e.message : String(e),
        color: 'red',
      });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
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
        {pageItems.length > 0 && (
          <Group justify="space-between" px="md" py="sm">
            <Checkbox
              label="Select all on page"
              checked={allOnPageSelected}
              indeterminate={someOnPageSelected}
              onChange={toggleAllOnPage}
            />
            {selected.size > 0 && (
              <Group gap="sm">
                <Text size="sm" c="dimmed">
                  {selected.size} selected
                </Text>
                <Button onClick={() => setShowHeat(true)}>Build Heatmap</Button>
                <Button variant="default" onClick={clearSelection}>
                  Clear selection
                </Button>
              </Group>
            )}
          </Group>
        )}

        {loading && items.length === 0 ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : items.length === 0 ? (
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
                {pageItems.map((it) => (
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
                      <Tooltip label="Delete experiment" withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => void handleDelete(it.id)}
                          loading={deletingIds.has(it.id)}
                          aria-label={`delete row ${it.id}`}
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

        {items.length > 0 && (
          <Group justify="space-between" px="md" py="sm">
            <Group gap="sm">
              <Text size="sm" c="dimmed">
                Rows per page
              </Text>
              <Select
                size="xs"
                w={80}
                value={String(pageSize)}
                onChange={(v) => {
                  if (v == null) return;
                  setPageSize(Number(v));
                  setPage(1);
                }}
                data={PAGE_SIZE_OPTIONS}
                allowDeselect={false}
              />
              <Text size="sm" c="dimmed">
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, items.length)}{' '}
                of {items.length}
              </Text>
            </Group>
            <Pagination
              value={currentPage}
              onChange={setPage}
              total={totalPages}
              size="sm"
              withEdges
            />
          </Group>
        )}
      </Card>

      {heatmapVisible && heatmapModel.engines.length > 0 && (
        <Heatmap model={heatmapModel} onHide={() => setShowHeat(false)} />
      )}
    </Stack>
  );
}
