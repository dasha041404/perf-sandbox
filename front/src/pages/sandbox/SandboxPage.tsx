import { useState } from 'react';
import type { TemplateEngine } from '../../services/backend-types';
import { TEMPLATE_ENGINES } from '../../config/constants';
import styles from './SandboxPage.module.css';

interface FormErrors {
  engine?: string;
  inputData?: string;
  templateInput?: string;
}

export function SandboxPage() {
  const [engine, setEngine] = useState<TemplateEngine | ''>('');
  const [inputData, setInputData] = useState('');
  const [templateInput, setTemplateInput] = useState('');
  const [hasSubmittedAttempt, setHasSubmittedAttempt] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!engine) {
      newErrors.engine = 'Please select a template engine';
    }

    if (!inputData.trim()) {
      newErrors.inputData = 'Input data is required';
    }

    if (!templateInput.trim()) {
      newErrors.templateInput = 'Template input is required';
    }

    return newErrors;
  };

  const isFormValid =
    Object.keys(errors).length === 0 && engine && inputData.trim() && templateInput.trim();

  const handleRunExperiment = () => {
    const formErrors = validateForm();
    setErrors(formErrors);
    setHasSubmittedAttempt(true);

    if (Object.keys(formErrors).length === 0) {
      console.log('Run Experiment:', {
        engine,
        inputData,
        templateInput,
      });
    }
  };

  const handleGenerateForOtherEngines = () => {
    const formErrors = validateForm();
    setErrors(formErrors);
    setHasSubmittedAttempt(true);

    if (Object.keys(formErrors).length === 0) {
      console.log('Generate for other engines:', {
        engine,
        inputData,
        templateInput,
      });
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Template Engine Section */}
        <section className={styles.section}>
          <label className={styles.label}>Template Engine</label>
          <select
            className={`${styles.select} ${hasSubmittedAttempt && errors.engine ? styles.inputError : ''}`}
            value={engine}
            onChange={(e) => {
              setEngine(e.target.value as TemplateEngine | '');
              if (e.target.value) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.engine;
                  return newErrors;
                });
              }
            }}
          >
            <option value="" disabled>
              Select a Template Engine
            </option>
            {TEMPLATE_ENGINES.map((engine: TemplateEngine) => (
              <option key={engine} value={engine}>
                {engine}
              </option>
            ))}
          </select>
          {hasSubmittedAttempt && errors.engine && (
            <p className={styles.errorMessage}>{errors.engine}</p>
          )}
        </section>

        {/* Input Data Section */}
        <section className={styles.section}>
          <label className={styles.label}>Input Data</label>
          <p className={styles.helperText}>
            Enter key-value pairs (format: key: value). Each pair must be on a new line.
          </p>
          <textarea
            className={`${styles.textarea} ${hasSubmittedAttempt && errors.inputData ? styles.inputError : ''}`}
            placeholder="name: John&#10;age: 25"
            value={inputData}
            onChange={(e) => {
              setInputData(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.inputData;
                  return newErrors;
                });
              }
            }}
          />
          {hasSubmittedAttempt && errors.inputData && (
            <p className={styles.errorMessage}>{errors.inputData}</p>
          )}
        </section>

        {/* Template Input Section */}
        <section className={styles.section}>
          <label className={styles.label}>Template Input</label>
          <textarea
            className={`${styles.textarea} ${hasSubmittedAttempt && errors.templateInput ? styles.inputError : ''}`}
            placeholder="Enter template... e.g. Hello {{name}}"
            value={templateInput}
            onChange={(e) => {
              setTemplateInput(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.templateInput;
                  return newErrors;
                });
              }
            }}
          />
          {hasSubmittedAttempt && errors.templateInput && (
            <p className={styles.errorMessage}>{errors.templateInput}</p>
          )}
        </section>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={handleRunExperiment}
            disabled={hasSubmittedAttempt && !isFormValid}
          >
            Run Experiment
          </button>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleGenerateForOtherEngines}
            disabled={hasSubmittedAttempt && !isFormValid}
          >
            Generate for other engines
          </button>
        </div>
      </div>
    </main>
  );
}
