import { useMemo } from "react";

interface JsonViewerProps {
  data: unknown;
  className?: string;
}

export function JsonViewer({ data, className = "" }: JsonViewerProps) {
  // Simple syntax highlighting for JSON using regex
  const highlightedJson = useMemo(() => {
    if (!data) return "";
    let json = JSON.stringify(data, null, 2);
    
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }, [data]);

  return (
    <pre 
      className={`font-mono text-[13px] leading-relaxed overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: highlightedJson }}
    />
  );
}
