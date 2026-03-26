import React, { useState, useCallback } from 'react';
import { classifyDocument } from '../services/api';

const CATEGORY_ICONS = {
  resume: '👤',
  invoice: '🧾',
  legal: '⚖️',
  medical: '🏥',
  financial: '📊',
};

const CATEGORY_COLORS = {
  resume: '#3b82f6',
  invoice: '#f59e0b',
  legal: '#8b5cf6',
  medical: '#10b981',
  financial: '#ef4444',
};

export default function DocumentClassifier() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    setFile(f);
    setResult(null);
    setError('');
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleClassify = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const data = await classifyDocument(file);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Classification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>AI-Powered</div>
          <h1 style={styles.title}>Document Classifier</h1>
          <p style={styles.subtitle}>
            Upload a PDF, DOCX, or TXT file and our model will classify it instantly
          </p>
        </div>

        {/* Upload Zone */}
        <div
          style={{
            ...styles.dropzone,
            borderColor: dragging ? '#6366f1' : file ? '#10b981' : '#334155',
            background: dragging ? 'rgba(99,102,241,0.05)' : 'rgba(15,23,42,0.6)',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.docx,.txt"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {file ? (
            <div style={styles.fileInfo}>
              <span style={styles.fileIcon}>📄</span>
              <span style={styles.fileName}>{file.name}</span>
              <span style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          ) : (
            <div style={styles.dropContent}>
              <span style={styles.uploadIcon}>⬆️</span>
              <p style={styles.dropText}>Drop your document here or click to browse</p>
              <p style={styles.dropHint}>Supports PDF, DOCX, TXT — Max 10MB</p>
            </div>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          style={{
            ...styles.button,
            opacity: !file || loading ? 0.5 : 1,
            cursor: !file || loading ? 'not-allowed' : 'pointer',
          }}
          onClick={handleClassify}
          disabled={!file || loading}
        >
          {loading ? '🔄 Analyzing...' : '🔍 Classify Document'}
        </button>

        {/* Results */}
        {result && (
          <div style={styles.results}>
            <div style={styles.resultHeader}>
              <span style={styles.resultIcon}>
                {CATEGORY_ICONS[result.predicted_category] || '📁'}
              </span>
              <div>
                <p style={styles.resultLabel}>Classified As</p>
                <h2 style={{
                  ...styles.resultCategory,
                  color: CATEGORY_COLORS[result.predicted_category] || '#6366f1'
                }}>
                  {result.predicted_category.toUpperCase()}
                </h2>
              </div>
              <div style={{
                ...styles.accuracyBadge,
                background: result.accuracy_label === 'High' ? '#10b981'
                  : result.accuracy_label === 'Medium' ? '#f59e0b' : '#ef4444'
              }}>
                {result.accuracy_label} Confidence
              </div>
            </div>

            {/* Confidence Bar */}
            <div style={styles.confSection}>
              <div style={styles.confHeader}>
                <span>Confidence Score</span>
                <span style={styles.confValue}>{result.confidence.toFixed(1)}%</span>
              </div>
              <div style={styles.confBar}>
                <div style={{
                  ...styles.confFill,
                  width: `${result.confidence}%`,
                  background: CATEGORY_COLORS[result.predicted_category] || '#6366f1'
                }} />
              </div>
            </div>

            {/* All Scores */}
            <div style={styles.scoresGrid}>
              {Object.entries(result.all_scores)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, score]) => (
                  <div key={cat} style={styles.scoreCard}>
                    <span style={styles.scoreCatIcon}>{CATEGORY_ICONS[cat]}</span>
                    <span style={styles.scoreCat}>{cat}</span>
                    <div style={styles.scoreMiniBar}>
                      <div style={{
                        height: '4px',
                        width: `${score}%`,
                        background: CATEGORY_COLORS[cat],
                        borderRadius: '2px',
                        transition: 'width 0.8s ease'
                      }} />
                    </div>
                    <span style={styles.scoreVal}>{score.toFixed(1)}%</span>
                  </div>
                ))}
            </div>

            <div style={styles.meta}>
              <span>📄 {result.filename}</span>
              <span>📝 {result.word_count.toLocaleString()} words</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: "'DM Sans', sans-serif",
  },
  container: {
    width: '100%',
    maxWidth: '720px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: { textAlign: 'center' },
  badge: {
    display: 'inline-block',
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.4)',
    color: '#a5b4fc',
    padding: '0.3rem 1rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#f1f5f9',
    margin: '0 0 0.5rem',
    letterSpacing: '-0.02em',
  },
  subtitle: { color: '#94a3b8', fontSize: '1rem', margin: 0 },
  dropzone: {
    border: '2px dashed',
    borderRadius: '16px',
    padding: '3rem 2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dropContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  uploadIcon: { fontSize: '2.5rem' },
  dropText: { color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 600, margin: 0 },
  dropHint: { color: '#64748b', fontSize: '0.85rem', margin: 0 },
  fileInfo: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
  },
  fileIcon: { fontSize: '2.5rem' },
  fileName: { color: '#10b981', fontWeight: 700, fontSize: '1.1rem' },
  fileSize: { color: '#64748b', fontSize: '0.85rem' },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
  },
  button: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 700,
    transition: 'all 0.2s',
    width: '100%',
  },
  results: {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  resultHeader: {
    display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
  },
  resultIcon: { fontSize: '3rem' },
  resultLabel: { color: '#64748b', fontSize: '0.8rem', margin: '0 0 0.25rem', textTransform: 'uppercase' },
  resultCategory: { fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '0.05em' },
  accuracyBadge: {
    marginLeft: 'auto', padding: '0.4rem 0.9rem', borderRadius: '999px',
    color: '#fff', fontWeight: 700, fontSize: '0.8rem',
  },
  confSection: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  confHeader: { display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem' },
  confValue: { color: '#f1f5f9', fontWeight: 700 },
  confBar: { height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: '4px', transition: 'width 1s ease' },
  scoresGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  scoreCard: {
    display: 'grid',
    gridTemplateColumns: '1.5rem 6rem 1fr 3rem',
    alignItems: 'center',
    gap: '0.75rem',
  },
  scoreCatIcon: { fontSize: '1.1rem' },
  scoreCat: { color: '#cbd5e1', fontSize: '0.9rem', textTransform: 'capitalize' },
  scoreMiniBar: { height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' },
  scoreVal: { color: '#94a3b8', fontSize: '0.85rem', textAlign: 'right' },
  meta: {
    display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.85rem', flexWrap: 'wrap'
  },
};
