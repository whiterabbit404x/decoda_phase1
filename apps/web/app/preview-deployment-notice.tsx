export default function PreviewDeploymentNotice() {
  return (
    <aside className="dataCard previewDeploymentNotice" role="note" aria-live="polite">
      <p className="eyebrow">Preview deployment</p>
      <h2>Preview environment detected</h2>
      <p>
        <strong>This is a deployment-specific preview URL. Older preview URLs may not reflect the latest source.</strong>
      </p>
      <p>
        Check <a href="/api/build-info">/api/build-info</a> first to confirm the environment, host, branch, commit, auth mode,
        and backend API URL resolved for this preview before escalating auth issues.
      </p>
    </aside>
  );
}
