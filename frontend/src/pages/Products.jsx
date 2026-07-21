import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [selectedId, setSelectedId] = useState(1)
  const [comments, setComments] = useState([])
  const [commentUser, setCommentUser] = useState('guest')
  const [commentText, setCommentText] = useState('')
  const [greetName, setGreetName] = useState('')
  const [greetMsg, setGreetMsg] = useState('')

  useEffect(() => {
    apiGet('/products').then((data) => setProducts(data.products || []))
    loadComments(1)
  }, [])

  async function loadComments(productId) {
    setSelectedId(productId)
    const data = await apiGet(`/products/${productId}/comments`)
    setComments(data.comments || [])
  }

  async function handleSearch(e) {
    e.preventDefault()
    const data = await apiGet(`/products/search?q=${encodeURIComponent(search)}`)
    setSearchResult(data)
  }

  async function postComment(e) {
    e.preventDefault()
    await apiPost(`/products/${selectedId}/comments`, {
      username: commentUser,
      content: commentText,
    })
    setCommentText('')
    loadComments(selectedId)
  }

  async function handleGreet(e) {
    e.preventDefault()
    const data = await apiGet(`/greet?name=${encodeURIComponent(greetName)}`)
    setGreetMsg(data.message)
  }

  return (
    <>
      <div className="card">
        <span className="tag">SQL Injection</span>
        <h2>Product Search</h2>
        <p className="hint">Try search: <code>' OR 1=1 --</code></p>
        <form onSubmit={handleSearch}>
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        {searchResult && <pre>{JSON.stringify(searchResult, null, 2)}</pre>}
      </div>

      <div className="card">
        <span className="tag">Reflected XSS</span>
        <h2>Greeting</h2>
        <p className="hint">Try name: <code>{'<img src=x onerror=alert(1)>'}</code></p>
        <form onSubmit={handleGreet}>
          <input value={greetName} onChange={(e) => setGreetName(e.target.value)} placeholder="Your name" />
          <button type="submit">Greet</button>
        </form>
        {greetMsg && (
          <div className="output" dangerouslySetInnerHTML={{ __html: greetMsg }} />
        )}
      </div>

      <div className="card">
        <span className="tag">Stored XSS</span>
        <h2>Products & Comments</h2>
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              <button type="button" className="secondary" onClick={() => loadComments(p.id)}>
                #{p.id} {p.name} - ${p.price}
              </button>
            </li>
          ))}
        </ul>

        <h3>Comments for product #{selectedId}</h3>
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <strong>{c.username}</strong>
            <div dangerouslySetInnerHTML={{ __html: c.content }} />
          </div>
        ))}

        <form onSubmit={postComment}>
          <label>Your name</label>
          <input value={commentUser} onChange={(e) => setCommentUser(e.target.value)} />
          <label>Comment (HTML allowed - XSS)</label>
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="<script>alert('stored xss')</script>"
          />
          <button type="submit">Post Comment</button>
        </form>
      </div>
    </>
  )
}
