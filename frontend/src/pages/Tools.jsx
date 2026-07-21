import { useState } from 'react'
import { apiPost } from '../api'

export default function Tools() {
  const [host, setHost] = useState('127.0.0.1')
  const [filename, setFilename] = useState('readme.txt')
  const [url, setUrl] = useState('https://example.com')
  const [expression, setExpression] = useState('2 + 2')
  const [sessionData, setSessionData] = useState('')
  const [pickleInput, setPickleInput] = useState('')
  const [output, setOutput] = useState(null)

  async function run(action) {
    let result
    switch (action) {
      case 'ping':
        result = await apiPost('/tools/ping', { host })
        break
      case 'file':
        result = await fetch(`/api/files/read?file=${encodeURIComponent(filename)}`).then((r) => r.json()).then((data) => ({ status: 200, data }))
        break
      case 'fetch':
        result = await apiPost('/fetch', { url })
        break
      case 'calc':
        result = await apiPost('/calc', { expression })
        break
      case 'saveSession':
        result = await apiPost('/session/save', { preferences: { theme: sessionData || 'dark' } })
        if (result.data.data) setPickleInput(result.data.data)
        break
      case 'loadSession':
        result = await apiPost('/session/load', { data: pickleInput })
        break
      default:
        return
    }
    setOutput(result)
  }

  return (
    <>
      <div className="card">
        <span className="tag">Command Injection</span>
        <h2>Network Ping</h2>
        <p className="hint">Windows try: <code>127.0.0.1 &amp; whoami</code> or <code>127.0.0.1 | dir</code></p>
        <input value={host} onChange={(e) => setHost(e.target.value)} />
        <button type="button" onClick={() => run('ping')}>Ping</button>
      </div>

      <div className="card">
        <span className="tag">Path Traversal</span>
        <h2>File Reader</h2>
        <p className="hint">Try: <code>private/secret.txt</code> or <code>../app.py</code></p>
        <input value={filename} onChange={(e) => setFilename(e.target.value)} />
        <button type="button" onClick={() => run('file')}>Read File</button>
      </div>

      <div className="card">
        <span className="tag">SSRF</span>
        <h2>URL Fetcher</h2>
        <p className="hint">Try internal URLs: <code>http://127.0.0.1:5000/api/debug/config</code></p>
        <input value={url} onChange={(e) => setUrl(e.target.value)} />
        <button type="button" onClick={() => run('fetch')}>Fetch URL</button>
      </div>

      <div className="card">
        <span className="tag">Code Injection (eval)</span>
        <h2>Calculator</h2>
        <p className="hint">Try: <code>__import__('os').system('whoami')</code></p>
        <input value={expression} onChange={(e) => setExpression(e.target.value)} />
        <button type="button" onClick={() => run('calc')}>Calculate</button>
      </div>

      <div className="card">
        <span className="tag">Insecure Deserialization</span>
        <h2>Session (Pickle)</h2>
        <p className="hint">Save preferences, then replace blob with malicious pickle payload.</p>
        <input
          placeholder="preference value"
          value={sessionData}
          onChange={(e) => setSessionData(e.target.value)}
        />
        <button type="button" onClick={() => run('saveSession')}>Save Session</button>
        <textarea
          rows={3}
          value={pickleInput}
          onChange={(e) => setPickleInput(e.target.value)}
          placeholder="base64 pickle blob"
        />
        <button type="button" onClick={() => run('loadSession')}>Load Session</button>
      </div>

      {output && <pre>{JSON.stringify(output, null, 2)}</pre>}
    </>
  )
}
