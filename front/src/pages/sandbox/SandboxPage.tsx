import styles from './SandboxPage.module.css';

export function SandboxPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Template Engine Section */}
        <section className={styles.section}>
          <label className={styles.label}>Template Engine</label>
          <select className={styles.select} defaultValue="">
            <option value="" disabled>
              Select a Template Engine
            </option>
            <option value="handlebars">Handlebars</option>
            <option value="mustache">Mustache</option>
            <option value="ejs">EJS</option>
            <option value="pug">Pug</option>
            <option value="nunjucks">Nunjucks</option>
            <option value="liquid">Liquid</option>
          </select>
        </section>

        {/* Input Data Section */}
        <section className={styles.section}>
          <label className={styles.label}>Input Data</label>
          <p className={styles.helperText}>
            Enter key-value pairs (format: key: value). Each pair must be on a new line.
          </p>
          <textarea
            className={styles.textarea}
            placeholder="name: John&#10;age: 25"
          />
        </section>

        {/* Template Input Section */}
        <section className={styles.section}>
          <label className={styles.label}>Template Input</label>
          <textarea
            className={styles.textarea}
            placeholder="Enter template... e.g. Hello {{name}}"
          />
        </section>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className={`${styles.button} ${styles.buttonPrimary}`}>Run Experiment</button>
          <button className={`${styles.button} ${styles.buttonSecondary}`}>
            Generate for other engines
          </button>
        </div>
      </div>
    </main>
  );
}
