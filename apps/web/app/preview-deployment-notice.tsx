export default function PreviewDeploymentNotice() {
  return (
    <aside className="dataCard previewDeploymentNotice" role="alert" aria-live="polite">
      <p className="eyebrow">Preview deployment</p>
      <h2>Deployment-specific preview URL</h2>
      <p>
        Preview URLs are deployment-specific, and old preview URLs may not reflect the latest source even when the branch name looks familiar.
      </p>
      <p>
        Compare the commit SHA on this page with <a href="/api/build-info">/api/build-info</a> before debugging auth behavior.
      </p>
    </aside>
  );
}
