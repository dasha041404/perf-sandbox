import { Badge, Box, Card, Group, ScrollArea, Text, Title, Button } from '@mantine/core';

import { BUCKET_COLORS, bucketFor, type HeatmapModel, truncate } from '../../lib/heatmap';

interface HeatmapProps {
  model: HeatmapModel;
  onHide: () => void;
}

export function Heatmap({ model, onHide }: HeatmapProps) {
  return (
    <Card withBorder padding="lg">
      <Group justify="space-between" mb="sm">
        <Title order={3}>Performance Heatmap</Title>
        <Button variant="default" size="sm" onClick={onHide}>
          Hide Heatmap
        </Button>
      </Group>

      <Group gap="md" mb="md">
        <Text size="sm" c="dimmed">
          Execution Time (ms):
        </Text>
        <Badge color="teal" variant="filled">
          Fast &lt; 5
        </Badge>
        <Badge color="yellow" variant="filled">
          Medium 5–50
        </Badge>
        <Badge color="red" variant="filled">
          Slow &gt; 50
        </Badge>
      </Group>

      <ScrollArea>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `minmax(120px, max-content) repeat(${model.outputs.length}, minmax(110px, 1fr))`,
            gap: 6,
            minWidth: '100%',
          }}
        >
          {/* Header row */}
          <Box />
          {model.outputs.map((out) => (
            <Box
              key={`h-${out}`}
              p="xs"
              style={{ fontFamily: 'var(--mantine-font-family-monospace)', fontSize: 12 }}
              title={out}
            >
              {truncate(out, 22)}
            </Box>
          ))}

          {/* Body */}
          {model.engines.map((e) => (
            <RowFragment key={e} engine={e} model={model} />
          ))}
        </Box>
      </ScrollArea>
    </Card>
  );
}

function RowFragment({ engine, model }: { engine: string; model: HeatmapModel }) {
  return (
    <>
      <Box p="xs" fw={600}>
        {engine}
      </Box>
      {model.outputs.map((out) => {
        const v = model.cells[`${engine}::${out}`];
        if (v == null) {
          return (
            <Box
              key={`${engine}-${out}`}
              p="xs"
              ta="center"
              c="dimmed"
              style={{
                background: 'var(--mantine-color-dark-6)',
                borderRadius: 6,
              }}
            >
              —
            </Box>
          );
        }
        const bucket = bucketFor(v);
        return (
          <Box
            key={`${engine}-${out}`}
            p="xs"
            ta="center"
            c="white"
            style={{ background: BUCKET_COLORS[bucket], borderRadius: 6 }}
          >
            {v.toFixed(2)}
          </Box>
        );
      })}
    </>
  );
}
