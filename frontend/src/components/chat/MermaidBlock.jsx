import { useEffect, useRef, useState } from "react";

const MermaidBlock = ({ chart }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = await import("mermaid");
        mermaid.default.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "sandbox",
        });

        const id = `mermaid-${Date.now()}`;
        const { svg: svgText } = await mermaid.default.render(id, chart);
        if (!cancelled) setSvg(svgText);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to render diagram");
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <details className="mermaid-fallback">
        <summary>Diagram (failed to render, click to see source)</summary>
        <pre><code>{chart}</code></pre>
      </details>
    );
  }

  if (!svg) {
    return <div className="mermaid-loading">Rendering diagram...</div>;
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-block"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidBlock;
