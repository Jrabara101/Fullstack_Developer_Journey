import type { SyntaxCategory } from '../types/typing'

export interface CodeSnippet {
  id: string
  title: string
  category: SyntaxCategory
  code: string
}

export const CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'react-use-effect',
    title: 'React useEffect with Cleanup',
    category: 'react',
    code: 'useEffect(() => { const handleResize = () => setWidth(window.innerWidth); window.addEventListener("resize", handleResize); return () => window.removeEventListener("resize", handleResize); }, []);'
  },
  {
    id: 'react-custom-hook',
    title: 'Custom Debounce Hook',
    category: 'react',
    code: 'export function useDebounce<T>(value: T, delay: number = 300): T { const [debounced, setDebounced] = useState<T>(value); useEffect(() => { const timer = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(timer); }, [value, delay]); return debounced; }'
  },
  {
    id: 'react-reducer',
    title: 'React useReducer Pattern',
    category: 'react',
    code: 'const [state, dispatch] = useReducer((prev: State, action: Action): State => { switch (action.type) { case "INCREMENT": return { ...prev, count: prev.count + 1 }; case "RESET": return { ...prev, count: 0 }; default: return prev; } }, { count: 0 });'
  },
  {
    id: 'ts-generic-utility',
    title: 'TypeScript Deep Readonly',
    category: 'typescript',
    code: 'type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends Record<string, unknown> ? DeepReadonly<T[K]> : T[K]; };'
  },
  {
    id: 'ts-discriminated-union',
    title: 'Discriminated Union & Guard',
    category: 'typescript',
    code: 'type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E }; function unwrap<T>(res: Result<T>): T { if (!res.ok) { throw res.error; } return res.data; }'
  },
  {
    id: 'js-array-pipeline',
    title: 'Functional Array Pipeline',
    category: 'javascript',
    code: 'const activeHighEarners = users.filter((u) => u.active && u.salary > 85000).map((u) => ({ id: u.id, fullName: `${u.firstName} ${u.lastName}`, bonus: u.salary * 0.15 })).sort((a, b) => b.bonus - a.bonus);'
  },
  {
    id: 'js-promise-allsettled',
    title: 'Promise Batch Handling',
    category: 'javascript',
    code: 'const results = await Promise.allSettled(urls.map(async (url) => { const res = await fetch(url); if (!res.ok) throw new Error(res.statusText); return res.json(); }));'
  },
  {
    id: 'python-memoize',
    title: 'Python Memoization Decorator',
    category: 'python',
    code: 'def memoize(func): cache = {} def wrapper(*args): if args not in cache: cache[args] = func(*args) return cache[args] return wrapper'
  },
  {
    id: 'python-binary-search',
    title: 'Binary Search Implementation',
    category: 'python',
    code: 'def binary_search(arr: list[int], target: int) -> int: left, right = 0, len(arr) - 1 while left <= right: mid = (left + right) // 2 if arr[mid] == target: return mid elif arr[mid] < target: left = mid + 1 else: right = mid - 1 return -1'
  },
  {
    id: 'sql-complex-query',
    title: 'Window Function Aggregation',
    category: 'sql',
    code: 'SELECT user_id, order_date, total_amount, DENSE_RANK() OVER (PARTITION BY user_id ORDER BY total_amount DESC) as rank_score, AVG(total_amount) OVER (PARTITION BY user_id) as avg_spend FROM orders WHERE status = "delivered" HAVING total_amount > 50;'
  },
  {
    id: 'bash-docker-deploy',
    title: 'Docker Build & Healthcheck',
    category: 'bash',
    code: 'docker build -t app:latest . && docker run -d --name app_service -p 3000:3000 --restart always -e NODE_ENV=production app:latest && curl -sSf http://localhost:3000/health || exit 1'
  }
]

export function getRandomCodeSnippet(category?: SyntaxCategory): CodeSnippet {
  const pool = category ? CODE_SNIPPETS.filter(s => s.category === category) : CODE_SNIPPETS
  if (pool.length === 0) return CODE_SNIPPETS[0]
  const idx = Math.floor(Math.random() * pool.length)
  return pool[idx]
}
