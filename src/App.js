import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import logo from './assets/logo.png';
// Güvenlik için DOMPurify kütüphanesini içe aktarıyoruz
import DOMPurify from 'dompurify';

function App() {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [xmlData, setXmlData] = useState('');
  const [xmlDir, setXmlDir] = useState('');
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const iframeRef = useRef(null);

  const TEMPLATES = {
    berat: 'berat.xslt',
    kebir: 'kebir.xslt',
    yevmiye: 'yevmiye.xslt',
    defterraporu: 'defterraporu.xslt'
  };

  const extractXsltFilename = (xml) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'application/xml');
      for (const node of doc.childNodes) {
        if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE && node.target === 'xml-stylesheet') {
          const match = node.data.match(/href=["']([^"']+)["']/);
          if (match && match[1]) return match[1].split(/[/\\]/).pop();
        }
      }
    } catch {}
    return null;
  };

  const processXml = async (xmlPath) => {
    if (!window.electronAPI) return;
    try {
      setLoading(true); setError(''); setHtmlContent(''); setAvailableTemplates([]); setSelectedTemplate('');
      const xml = await window.electronAPI.loadXml(xmlPath);
      const dir = xmlPath.substring(0, xmlPath.lastIndexOf('\\'));
      setXmlData(xml); setXmlDir(dir); setFileName(xmlPath.split('\\').pop());

      const available = [];
      for (const [key, file] of Object.entries(TEMPLATES)) {
        try { 
          await window.electronAPI.loadXslt(dir + '\\' + file);
          available.push(key); 
        } catch {}
      }
      setAvailableTemplates(available);

      const headerXslt = extractXsltFilename(xml);
      let selectedKey = null;
      if (headerXslt) {
        const found = Object.entries(TEMPLATES).find(([, file]) => file.toLowerCase() === headerXslt.toLowerCase());
        if (found && available.includes(found[0])) selectedKey = found[0];
      }

      if (selectedKey) {
        const xslt = await window.electronAPI.loadXslt(dir + '\\' + TEMPLATES[selectedKey]);
        setHtmlContent(transformXmlWithXslt(xml, xslt));
        setSelectedTemplate(selectedKey);
      } else {
        setHtmlContent(createGenericViewer(xml));
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleOpenFile = async () => {
    if (!window.electronAPI) return;
    const path = await window.electronAPI.openFile();
    if (path) processXml(path);
  };

  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.onOpenFileRequest(handleOpenFile);
    window.electronAPI.onOpenXmlFromOS((path) => { if (path) processXml(path); });
  }, []);

  const applyTemplate = async (key) => {
    if (!xmlData || !xmlDir || !window.electronAPI) return;
    try {
      setLoading(true); setError('');
      const xslt = await window.electronAPI.loadXslt(xmlDir + '\\' + TEMPLATES[key]);
      setHtmlContent(transformXmlWithXslt(xmlData, xslt));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const transformXmlWithXslt = (xml, xslt) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'application/xml');
    const xsltDoc = parser.parseFromString(xslt, 'application/xml');
    const processor = new XSLTProcessor();
    processor.importStylesheet(xsltDoc);
    const fragment = processor.transformToFragment(xmlDoc, document);
    const div = document.createElement('div'); 
    div.appendChild(fragment);
    
    // GÜVENLİK: DOMPurify ile HTML içeriğini temizliyoruz (XSS Koruması)
    const cleanHtml = DOMPurify.sanitize(div.innerHTML, {
      ADD_TAGS: ['style'], // XSLT içindeki stilleri korumak için
      WHOLE_DOCUMENT: true
    });
    
    return cleanHtml;
  };

  const createGenericViewer = (xml) =>
    `<pre style="white-space:pre-wrap;font-family:monospace">${xml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')}</pre>`;

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <img src={logo} alt="LOGO" className="brand-logo" />
          <h1>E-Defter Görüntüleyici</h1>
        </div>

        <div className="button-group">
          <button onClick={handleOpenFile} disabled={loading} className="btn btn-primary">
            {loading ? 'Yükleniyor…' : 'XML Aç'}
          </button>

          {availableTemplates.length > 0 && (
            <select
              className="template-select"
              value={selectedTemplate}
              onChange={(e) => { setSelectedTemplate(e.target.value); applyTemplate(e.target.value); }}
              disabled={loading}
            >
              <option value="">-- Şablon Seç --</option>
              {availableTemplates.map((key) => (
                <option key={key} value={key}>{key} ({TEMPLATES[key]})</option>
              ))}
            </select>
          )}

          {htmlContent && (
            <button
              onClick={() => {
                const a = document.createElement('a');
                const blob = new Blob([htmlContent], { type: 'text/html' });
                a.href = URL.createObjectURL(blob);
                a.download = fileName.replace('.xml', '.html');
                a.click();
              }}
              className="btn btn-secondary"
            >
              HTML Olarak İndir
            </button>
          )}
        </div>

        {fileName && <p className="file-name">Açık dosya: {fileName}</p>}
        {error && <div className="error-box">Hata: {error}</div>}
      </div>

      {htmlContent ? (
        <iframe 
          ref={iframeRef} 
          srcDoc={htmlContent} 
          title="XML Viewer" 
          className="viewer-iframe" 
          sandbox="allow-same-origin"
        />
      ) : (
        <div className="empty-state">
          <p>Başlamak için bir XML dosyası açın.</p>
        </div>
      )}
    </div>
  );
}

export default App;