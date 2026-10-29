import csv
import json
import re
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Dict, List, Optional, Set
import defusedxml.minidom
import yaml
from app.converters.base import BaseConverter
from app.schemas.conversion import ConversionOptions

class HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.fed: List[str] = []
        self.ignore_tags = {"script", "style"}
        self.in_ignore = False

    def handle_starttag(self, tag: str, attrs: Any):
        if tag.lower() in self.ignore_tags:
            self.in_ignore = True
        elif tag.lower() in ("p", "br", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr"):
            self.fed.append("\n")

    def handle_endtag(self, tag: str):
        if tag.lower() in self.ignore_tags:
            self.in_ignore = False
        elif tag.lower() in ("p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr"):
            self.fed.append("\n")

    def handle_data(self, data: str):
        if not self.in_ignore:
            self.fed.append(data)

    def get_text(self) -> str:
        text = "".join(self.fed)
        # Collapse multiple empty lines
        return re.sub(r"\n{3,}", "\n\n", text).strip()


class TextDataConverter(BaseConverter):
    SUPPORTED_INPUTS: Set[str] = {"txt", "md", "html", "htm", "json", "yaml", "yml", "xml", "csv"}
    SUPPORTED_OUTPUTS: Set[str] = {"txt", "md", "html", "json", "yaml", "xml", "csv"}

    def can_convert(self, source_ext: str, target_ext: str) -> bool:
        s = source_ext.lower().lstrip(".")
        t = target_ext.lower().lstrip(".")
        if s in ("htm", "html"):
            s = "html"
        if t in ("htm", "html"):
            t = "html"
        if s in ("yaml", "yml"):
            s = "yaml"
        if t in ("yaml", "yml"):
            t = "yaml"

        valid_pairs = {
            ("txt", "md"),
            ("txt", "html"),
            ("md", "html"),
            ("md", "txt"),
            ("html", "txt"),
            ("json", "yaml"),
            ("yaml", "json"),
            ("json", "json"),  # formatting
            ("json", "csv"),
            ("csv", "json"),
            ("xml", "xml"),   # formatting
        }
        return (s, t) in valid_pairs

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        options: Optional[ConversionOptions] = None,
    ) -> Path:
        s = input_path.suffix.lower().lstrip(".")
        t = output_path.suffix.lower().lstrip(".")
        if s in ("htm", "html"):
            s = "html"
        if t in ("htm", "html"):
            t = "html"
        if s in ("yaml", "yml"):
            s = "yaml"
        if t in ("yaml", "yml"):
            t = "yaml"

        indent = options.indent if (options and options.indent is not None) else 2

        with open(input_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        result_content = ""

        if s == "txt" and t == "md":
            result_content = content

        elif s == "txt" and t == "html":
            escaped = (
                content.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
            )
            paragraphs = escaped.split("\n\n")
            body_html = "\n".join(f"<p>{p.replace('\n', '<br>')}</p>" for p in paragraphs if p.strip())
            result_content = (
                "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n"
                "<title>Document</title>\n<style>body{font-family:sans-serif;line-height:1.6;margin:2rem;}</style>\n"
                f"</head>\n<body>\n{body_html}\n</body>\n</html>"
            )

        elif s == "md" and t == "html":
            # Convert markdown to HTML
            # Convert headers, bold, italics, links, and code blocks cleanly
            html_lines = []
            in_code_block = False
            for line in content.splitlines():
                if line.startswith("```"):
                    in_code_block = not in_code_block
                    tag = "<pre><code>" if in_code_block else "</code></pre>"
                    html_lines.append(tag)
                    continue
                if in_code_block:
                    html_lines.append(line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
                    continue

                # Headers
                m_header = re.match(r"^(#{1,6})\s+(.*)$", line)
                if m_header:
                    level = len(m_header.group(1))
                    text = m_header.group(2)
                    html_lines.append(f"<h{level}>{text}</h{level}>")
                    continue

                # Unordered lists
                if re.match(r"^[\*\-]\s+(.*)$", line):
                    item = re.sub(r"^[\*\-]\s+", "", line)
                    html_lines.append(f"<li>{item}</li>")
                    continue

                if line.strip():
                    # Inline bold and italics
                    formatted = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", line)
                    formatted = re.sub(r"\*(.+?)\*", r"<em>\1</em>", formatted)
                    # Links [text](url)
                    formatted = re.sub(r"\[(.+?)\]\((.+?)\)", r'<a href="\2">\1</a>', formatted)
                    html_lines.append(f"<p>{formatted}</p>")
                else:
                    html_lines.append("")

            body_html = "\n".join(html_lines)
            result_content = (
                "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n"
                "<title>Document</title>\n<style>body{font-family:sans-serif;line-height:1.6;margin:2rem;max-width:800px;}</style>\n"
                f"</head>\n<body>\n{body_html}\n</body>\n</html>"
            )

        elif s == "md" and t == "txt":
            # Strip markdown formatting
            stripped = re.sub(r"^#{1,6}\s+", "", content, flags=re.MULTILINE)
            stripped = re.sub(r"\*\*(.+?)\*\*", r"\1", stripped)
            stripped = re.sub(r"\*(.+?)\*", r"\1", stripped)
            stripped = re.sub(r"\[(.+?)\]\((.+?)\)", r"\1 (\2)", stripped)
            stripped = re.sub(r"`{1,3}(.*?)`{1,3}", r"\1", stripped)
            result_content = stripped

        elif s == "html" and t == "txt":
            extractor = HTMLTextExtractor()
            extractor.feed(content)
            result_content = unescape(extractor.get_text())

        elif s == "json" and t == "yaml":
            try:
                data = json.loads(content)
            except Exception as e:
                raise ValueError(f"Invalid JSON input: {e}")
            result_content = yaml.safe_dump(data, sort_keys=False, allow_unicode=True, indent=indent)

        elif s == "yaml" and t == "json":
            try:
                data = yaml.safe_load(content)
            except Exception as e:
                raise ValueError(f"Invalid YAML input: {e}")
            result_content = json.dumps(data, indent=indent, ensure_ascii=False)

        elif s == "json" and t == "json":
            try:
                data = json.loads(content)
            except Exception as e:
                raise ValueError(f"Invalid JSON input: {e}")
            result_content = json.dumps(data, indent=indent, ensure_ascii=False)

        elif s == "xml" and t == "xml":
            try:
                dom = defusedxml.minidom.parseString(content)
                result_content = dom.toprettyxml(indent=" " * indent)
            except Exception as e:
                raise ValueError(f"Invalid or unsafe XML input: {e}")

        elif s == "json" and t == "csv":
            try:
                data = json.loads(content)
            except Exception as e:
                raise ValueError(f"Invalid JSON input: {e}")

            if isinstance(data, dict):
                # If dictionary of records or single record
                if all(isinstance(v, dict) for v in data.values()):
                    records = [{"_key": k, **v} for k, v in data.items()]
                else:
                    records = [data]
            elif isinstance(data, list):
                if not data:
                    records = []
                elif all(isinstance(row, dict) for row in data):
                    records = data
                else:
                    records = [{"value": item} for item in data]
            else:
                raise ValueError("JSON content must be an array of objects or an object to convert to CSV.")

            if not records:
                result_content = ""
            else:
                # Deliberate flattening: collect all top-level keys
                headers = []
                for rec in records:
                    for k in rec.keys():
                        if k not in headers:
                            headers.append(k)

                import io
                out = io.StringIO()
                writer = csv.DictWriter(out, fieldnames=headers)
                writer.writeheader()
                for rec in records:
                    flat_rec = {}
                    for k in headers:
                        val = rec.get(k, "")
                        if isinstance(val, (dict, list)):
                            flat_rec[k] = json.dumps(val, ensure_ascii=False)
                        else:
                            flat_rec[k] = val
                    writer.writerow(flat_rec)
                result_content = out.getvalue()

        elif s == "csv" and t == "json":
            import io
            reader = csv.DictReader(io.StringIO(content))
            records = list(reader)
            result_content = json.dumps(records, indent=indent, ensure_ascii=False)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as out_f:
            out_f.write(result_content)

        if not output_path.exists() or output_path.stat().st_size == 0:
            # Note: an empty CSV or empty file can have size 0, but if we wrote empty content deliberately:
            if not result_content:
                output_path.touch()
            else:
                raise RuntimeError(f"Conversion to {t} resulted in empty output.")

        return output_path
