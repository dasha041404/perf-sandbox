import { useState } from 'react';
import { Alert, Button, Group, Loader, Select, Stack, Text, Textarea, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCircleCheck } from '@tabler/icons-react';

import type { TemplateEngine } from '../../services/backend-types';
import { ENGINES } from '../../lib/template-runners';
import { parseKeyValue } from '../../lib/parse-key-value';
import { runExperiment, todayIso } from '../../lib/measure';
import { createExperiment } from '../../services/experiments-service';
import { getTemplates } from '../../services/templates-service';
import { GenerateFlowModals, type GenerateStep } from './GenerateFlowModals';

const DEFAULT_DATA = 'name: John\nage: 25';
const DEFAULT_TEMPLATE_PLACEHOLDER = 'Enter template... e.g. Hello {{name}}';

export function SandboxPage() {
  const [engine, setEngine] = useState<TemplateEngine | null>(null);
  const [inputData, setInputData] = useState<string>(DEFAULT_DATA);
  const [template, setTemplate] = useState<string>('');

  const [running, setRunning] = useState(false);
  const [success, setSuccess] = useState<{ ms: number } | null>(null);

  // Generate flow state
  const [step, setStep] = useState<GenerateStep>('closed');
  const [targets, setTargets] = useState<TemplateEngine[]>([]);
  const [reviewItems, setReviewItems] = useState<{ engine: TemplateEngine; template: string }[]>(
    [],
  );
  const [submittingReview, setSubmittingReview] = useState(false);

  const closeGenerate = () => {
    setStep('closed');
    setTargets([]);
    setReviewItems([]);
  };

  function failNotify(title: string, message: string) {
    notifications.show({ title, message, color: 'red' });
  }

  async function handleRun() {
    if (!engine) {
      failNotify('Pick an engine', 'Select a template engine before running.');
      return;
    }
    setSuccess(null);
    setRunning(true);
    try {
      const data = parseKeyValue(inputData);
      const result = await runExperiment(engine, template, data);
      await createExperiment({
        engine,
        input_template: template,
        input_data: data,
        output: result.output,
        execution_time: result.execution_time_seconds,
        data: todayIso(),
      });
      setSuccess({ ms: result.execution_time_ms });
    } catch (e) {
      failNotify('Run failed', e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  function openGenerate() {
    if (!engine) {
      failNotify('Pick an engine', 'Select a source engine before generating.');
      return;
    }
    if (template.trim() === '') {
      failNotify('Empty template', 'Enter a template to transpile.');
      return;
    }
    setStep('select');
  }

  async function handleContinueGenerate() {
    if (!engine || targets.length === 0) return;
    setStep('loading');
    try {
      const out = await getTemplates({
        engines: targets,
        input_engine: engine,
        input_template: template,
      });
      const items = targets.map((e) => ({ engine: e, template: out[e] ?? '' }));
      setReviewItems(items);
      setStep('review');
    } catch (e) {
      failNotify('Generation failed', e instanceof Error ? e.message : String(e));
      setStep('select');
    }
  }

  async function handleConfirmReview() {
    setSubmittingReview(true);
    const errors: string[] = [];
    const succeeded: TemplateEngine[] = [];
    try {
      const data = parseKeyValue(inputData);
      for (const it of reviewItems) {
        try {
          const r = await runExperiment(it.engine, it.template, data);
          await createExperiment({
            engine: it.engine,
            input_template: it.template,
            input_data: data,
            output: r.output,
            execution_time: r.execution_time_seconds,
            data: todayIso(),
          });
          succeeded.push(it.engine);
        } catch (e) {
          errors.push(`${it.engine}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      if (succeeded.length > 0) {
        notifications.show({
          title: 'Benchmarks complete',
          message: `Saved: ${succeeded.join(', ')}`,
          color: 'teal',
        });
      }
      if (errors.length > 0) {
        failNotify('Some engines failed', errors.join('\n'));
      }
      closeGenerate();
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <Stack gap="lg">
      <Title order={2}>Sandbox</Title>

      <Select
        label="Template Engine"
        placeholder="Select a Template Engine"
        data={ENGINES.map((e) => ({ value: e, label: e }))}
        value={engine}
        onChange={(v) => setEngine((v as TemplateEngine) ?? null)}
        searchable={false}
        clearable
      />

      <Textarea
        label="Input Data"
        description="Provide key-value pairs, one per line (e.g. name: John). Values are auto-typed."
        value={inputData}
        onChange={(e) => setInputData(e.currentTarget.value)}
        minRows={6}
        autosize
        maxRows={14}
        styles={{ input: { fontFamily: 'var(--mantine-font-family-monospace)' } }}
      />

      <Textarea
        label="Template Input"
        placeholder={DEFAULT_TEMPLATE_PLACEHOLDER}
        value={template}
        onChange={(e) => setTemplate(e.currentTarget.value)}
        minRows={8}
        autosize
        maxRows={20}
        styles={{ input: { fontFamily: 'var(--mantine-font-family-monospace)' } }}
      />

      <Group>
        <Button onClick={handleRun} loading={running} disabled={running}>
          Run Experiment
        </Button>
        <Button variant="default" onClick={openGenerate} disabled={running}>
          Generate for other engines
        </Button>
      </Group>

      {running && (
        <Group gap="sm" c="dimmed">
          <Loader size="sm" />
          <Text size="sm">Running benchmark...</Text>
        </Group>
      )}

      {success && !running && (
        <Alert
          icon={<IconCircleCheck size={18} />}
          color="teal"
          variant="light"
          title="Benchmark complete!"
        >
          Execution time: {success.ms.toFixed(2)} ms
        </Alert>
      )}

      <GenerateFlowModals
        open={step !== 'closed'}
        step={step}
        onClose={closeGenerate}
        excludeEngine={engine}
        selectedTargets={targets}
        setSelectedTargets={setTargets}
        onContinue={handleContinueGenerate}
        reviewItems={reviewItems}
        updateReviewItem={(e, t) =>
          setReviewItems((prev) =>
            prev.map((it) => (it.engine === e ? { ...it, template: t } : it)),
          )
        }
        onBack={() => setStep('select')}
        onConfirm={handleConfirmReview}
        submitting={submittingReview}
      />
    </Stack>
  );
}
