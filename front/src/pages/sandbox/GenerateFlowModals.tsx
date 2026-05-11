import { useState } from 'react';
import {
  Button,
  Card,
  CloseButton,
  Group,
  Loader,
  Modal,
  MultiSelect,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';

import type { TemplateEngine } from '../../services/backend-types';
import { ENGINES } from '../../lib/template-runners';

export type GenerateStep = 'closed' | 'select' | 'loading' | 'review';

interface CommonProps {
  open: boolean;
  step: GenerateStep;
  onClose: () => void;
}

interface SelectProps {
  excludeEngine: TemplateEngine | null;
  selectedTargets: TemplateEngine[];
  setSelectedTargets: (engines: TemplateEngine[]) => void;
  onContinue: () => void;
}

interface ReviewProps {
  reviewItems: { engine: TemplateEngine; template: string }[];
  updateReviewItem: (engine: TemplateEngine, template: string) => void;
  onBack: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

export function GenerateFlowModals(props: CommonProps & SelectProps & ReviewProps) {
  const {
    open,
    step,
    onClose,
    excludeEngine,
    selectedTargets,
    setSelectedTargets,
    onContinue,
    reviewItems,
    updateReviewItem,
    onBack,
    onConfirm,
    submitting,
  } = props;

  const options = ENGINES.filter((e) => e !== excludeEngine).map((e) => ({ value: e, label: e }));

  return (
    <>
      {/* Step 1: Add Template Engines */}
      <Modal
        opened={open && step === 'select'}
        onClose={onClose}
        withCloseButton={false}
        size="lg"
        centered
        padding="lg"
      >
        <Stack gap="md">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={4}>
              <Title order={3}>Add Template Engines</Title>
              <Text c="dimmed" size="sm">
                Pick which engines to transpile the current template into.
              </Text>
            </Stack>
            <CloseButton onClick={onClose} aria-label="Close" />
          </Group>

          <MultiSelect
            label="Template Engines"
            placeholder="Select engines"
            data={options}
            value={selectedTargets}
            onChange={(v) => setSelectedTargets(v as TemplateEngine[])}
            searchable
            clearable
            hidePickedOptions
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onContinue} disabled={selectedTargets.length === 0}>
              Continue
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Step 2: Generating templates… */}
      <Modal
        opened={open && step === 'loading'}
        onClose={() => {
          /* not closable */
        }}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        size="md"
        centered
        padding="xl"
      >
        <Stack align="center" gap="sm" py="md">
          <Loader />
          <Title order={4}>Generating templates...</Title>
          <Text c="dimmed" size="sm">
            Translating template into selected engines.
          </Text>
        </Stack>
      </Modal>

      {/* Step 3: Review Generated Templates */}
      <Modal
        opened={open && step === 'review'}
        onClose={onClose}
        withCloseButton={false}
        size="xl"
        centered
        padding="lg"
      >
        <Stack gap="md">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={4}>
              <Title order={3}>Review Generated Templates</Title>
              <Text c="dimmed" size="sm">
                Edit each generated template before running benchmarks.
              </Text>
            </Stack>
            <CloseButton onClick={onClose} aria-label="Close" />
          </Group>

          <Stack gap="md" mah={500} style={{ overflowY: 'auto' }}>
            {reviewItems.map((it) => (
              <ReviewCard
                key={it.engine}
                engine={it.engine}
                template={it.template}
                onChange={(v) => updateReviewItem(it.engine, v)}
              />
            ))}
          </Stack>

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onBack} disabled={submitting}>
              Back
            </Button>
            <Button onClick={onConfirm} loading={submitting}>
              Confirm & Run
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

function ReviewCard({
  engine,
  template,
  onChange,
}: {
  engine: TemplateEngine;
  template: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <Card withBorder padding="sm">
      <Group justify="space-between" mb="xs">
        <Text fw={600}>{engine}</Text>
        <Button size="xs" variant="subtle" onClick={() => setEditing((v) => !v)}>
          {editing ? 'Lock' : 'Editable'}
        </Button>
      </Group>
      <Textarea
        value={template}
        onChange={(e) => onChange(e.currentTarget.value)}
        readOnly={!editing}
        minRows={4}
        autosize
        maxRows={12}
        styles={{ input: { fontFamily: 'var(--mantine-font-family-monospace)' } }}
      />
    </Card>
  );
}
