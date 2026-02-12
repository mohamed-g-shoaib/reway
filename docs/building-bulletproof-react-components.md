# Building Bulletproof React Components - Shu Ding

# Building Bulletproof React Components

> I skate to where the puck is going to be, not where it has been.  
> — Wayne Gretzky

Most components are built for the happy path. They work—until they don’t. The real world is hostile. Server rendering. Hydration. Multiple instances. Concurrent rendering. Async children. Portals... Your component could face all of them. The question is whether it survives.

The real test isn’t whether your component works on your current page. It’s whether it works when someone else uses it—in conditions you didn’t plan for. That’s when _fragile_ components break.

Here’s how to make it _survive_.

1.  [Make It **Server**\-Proof](#make-it-server-proof)
2.  [Make It **Hydration**\-Proof](#make-it-hydration-proof)
3.  [Make It **Instance**\-Proof](#make-it-instance-proof)
4.  [Make It **Concurrent**\-Proof](#make-it-concurrent-proof)
5.  [Make It **Composition**\-Proof](#make-it-composition-proof)
6.  [Make It **Portal**\-Proof](#make-it-portal-proof)
7.  [Make It **Transition**\-Proof](#make-it-transition-proof)
8.  [Make It **Activity**\-Proof](#make-it-activity-proof)
9.  [Make It **Leak**\-Proof](#make-it-leak-proof)
10. [Make It **Future**\-Proof](#make-it-future-proof)\*

## [#](#make-it-server-proof)Make It Server-Proof

A simple theme provider that reads the user’s preference from `localStorage`:

```
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  )

  return <div className={theme}>{children}</div>
}
```

Sidenote: Crashes in SSR—reads theme from localStorage

But `localStorage` doesn’t exist on the server. In Next.js, Remix, or any SSR framework, this crashes the build. Move browser APIs into `useEffect`:

```
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    setTheme(localStorage.getItem('theme') || 'light')
  }, [])

  return <div className={theme}>{children}</div>
}
```

Sidenote: useEffect defers localStorage to client-side only

Now it renders on the server without crashing.

## [#](#make-it-hydration-proof)Make It Hydration-Proof

I also call this waterproof. The server-safe version works, but users see a flash. Server renders `light`, client hydrates, then the effect runs and switches to `dark`:

```
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    setTheme(localStorage.getItem('theme') || 'light')
  }, [])

  return <div className={theme}>{children}</div>
}
```

Sidenote: Flash of wrong theme—useEffect runs after hydration

Inject a synchronous script that sets the correct value _before_ browser paints and React hydrates. The DOM already has the right class when React takes over:

```
function ThemeProvider({ children }) {
  return (
    <>
      <div id="theme">{children}</div>
      <script dangerouslySetInnerHTML={{ __html: `
        try {
          const theme = localStorage.getItem('theme') || 'light'
          document.getElementById('theme').className = theme
        } catch (e) {}
      `}} />
    </>
  )
}
```

Sidenote: Inline script sets theme before browser paints

No mismatch, no flash.

## [#](#make-it-instance-proof)Make It Instance-Proof

The hydration-proof version targets a hardcoded `id="theme"`. But what if someone uses two `ThemeProvider`s?

```
function App() {
  return (
    <>
      <ThemeProvider><MainContent /></ThemeProvider>
      <AlwaysLightThemeContent />
      <ThemeProvider><Sidebar /></ThemeProvider>
    </>
  )
}
```

Sidenote: Multiple instances—both scripts target the same ID

Both scripts fight over the same element. Use [`useId`](https://react.dev/reference/react/useId) to generate stable, unique IDs per instance:

```
function ThemeProvider({ children }) {
  const id = useId()
  return (
    <>
      <div id={id}>{children}</div>
      <script dangerouslySetInnerHTML={{ __html: `
        try {
          const theme = localStorage.getItem('theme') || 'light'
          document.getElementById('${id}').className = theme
        } catch (e) {}
      `}} />
    </>
  )
}
```

Sidenote: useId generates unique IDs per instance

Now multiple instances coexist safely.

## [#](#make-it-concurrent-proof)Make It Concurrent-Proof

Now let’s make the theme server-driven. A [Server Component](https://react.dev/reference/rsc/server-components) that fetches user preferences:

```
async function ThemeProvider({ children }) {
  const prefs = await db.preferences.get(userId)

  return <div className={prefs.theme}>{children}</div>
}
```

Sidenote: Server Component fetches preferences from database

Similar to before, render it in two places and you might get two identical database queries. Wrap the query in [`React.cache`](https://react.dev/reference/react/cache) to deduplicate within a single request:

```
import { cache } from 'react'

const getPreferences = cache(
  userId => db.preferences.get(userId)
)

async function ThemeProvider({ children }) {
  const prefs = await getPreferences(userId)

  return <div className={prefs.theme}>{children}</div>
}
```

Sidenote: React cache() deduplicates concurrent calls

Same query, called from anywhere, hits the database once.

## [#](#make-it-composition-proof)Make It Composition-Proof

Sometimes you want to pass data to children as props, which traditionally meant using `React.cloneElement`:

```
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, { theme })
  })
}
```

Sidenote: Passes theme to children via cloneElement

But with [React Server Components](https://react.dev/reference/rsc/server-components), [`React.lazy`](https://react.dev/reference/react/lazy), or [`"use cache"`](https://nextjs.org/docs/app/api-reference/directives/use-cache), `children` might be a Promise or an [opaque reference](https://react.dev/reference/react/Children#why-is-the-children-prop-not-always-an-array)—`cloneElement` won't work. Use context instead:

```
const ThemeContext = createContext('light')

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}
```

Sidenote: Context works everywhere—server, client, async

Children read the theme through `useContext`—no prop drilling, no cloning.

## [#](#make-it-portal-proof)Make It Portal-Proof

A theme provider with a keyboard shortcut—`Cmd+D` to toggle dark mode:

```
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const toggle = (e) => {
      if (e.metaKey && e.key === 'd') {
        e.preventDefault()
        setTheme(t => t === 'dark' ? 'light' : 'dark')
      }
    }
    window.addEventListener('keydown', toggle)
    return () => window.removeEventListener('keydown', toggle)
  }, [])

  return <div className={theme}>{children}</div>
}
```

Sidenote: Global keyboard shortcut to toggle theme

But if someone renders the app inside a pop-out window, iframe, or via [`createPortal`](https://react.dev/reference/react-dom/createPortal), the shortcut stops working. The listener is attached to the parent `window`, not the one your component lives in. Use `ownerDocument.defaultView`:

```
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const ref = useRef(null)

  useEffect(() => {
    const win = ref.current?.ownerDocument.defaultView || window
    const toggle = (e) => {
      if (e.metaKey && e.key === 'd') {
        e.preventDefault()
        setTheme(t => t === 'dark' ? 'light' : 'dark')
      }
    }
    win.addEventListener('keydown', toggle)
    return () => win.removeEventListener('keydown', toggle)
  }, [])

  return <div ref={ref} className={theme}>{children}</div>
}
```

Sidenote: ownerDocument.defaultView finds the correct window

Now the shortcut works in any window context.

## [#](#make-it-transition-proof)Make It Transition-Proof

A settings panel that toggles between simple and advanced views:

```
function ThemeSettings() {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <>
      {showAdvanced ? <AdvancedPanel /> : <SimplePanel />}
      <button onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? 'Simple' : 'Advanced'}
      </button>
    </>
  )
}
```

Sidenote: Simple state toggle between two panels

Wrap it in React 19’s [`<ViewTransition>`](https://react.dev/reference/react/ViewTransition), and nothing animates—the panels just snap. State updates must go through `startTransition`:

```
function ThemeSettings() {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <>
      {showAdvanced ? <AdvancedPanel /> : <SimplePanel />}
      <button onClick={() =>
        startTransition(() => setShowAdvanced(!showAdvanced))
      }>
        {showAdvanced ? 'Simple' : 'Advanced'}
      </button>
    </>
  )
}
```

Sidenote: startTransition enables the view transition

Now the transition animates smoothly.

## [#](#make-it-activity-proof)Make It Activity-Proof

A theme component that injects CSS variables via a `<style>` tag:

```
function DarkTheme({ children }) {
  return (
    <>
      <style>{`
        :root {
          --bg: #000;
          --fg: #fff;
        }
      `}</style>
      {children}
    </>
  )
}
```

Sidenote: Injects global CSS variables via style tag

But if you wrap it in [`<Activity>`](https://react.dev/reference/react/Activity), the dark theme persists even when hidden. `<Activity>` preserves DOM, and `<style>` has DOM-level side effects—it modifies `:root` variables globally. React can't automatically clean up these side effects. Set `media="not all"` to disable the styles when hidden:

```
function DarkTheme({ children }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (!ref.current) return
    ref.current.media = 'all'
    return () => ref.current.media = 'not all'
  }, [])

  return (
    <>
      <style ref={ref}>{`
        :root {
          --bg: #000;
          --fg: #fff;
        }
      `}</style>
      {children}
    </>
  )
}
```

Sidenote: useLayoutEffect sets media='not all' when hidden and restores it when unhidden

Now hidden components won't have the dark theme applied.

## [#](#make-it-leak-proof)Make It Leak-Proof

A Server Component that passes a `user` object (including a session token) to another theming component. Valid use case—you need the data on the server. You might know `UserThemeConfig` is a Server Component and it’s _safe_ to pass the data to it.

```
async function Dashboard() {
  const user = await getUser()

  return <UserThemeConfig user={user} />
}
```

Sidenote: Dashboard passes user (with token) to another component

However, you don’t know `UserThemeConfig`’s exact behavior, what it renders, or what a future version might do. You don’t maintain it.

Also because `UserThemeConfig` does not create `user`, it might not know that `user` has a sensitive `token` property. You do not control that component, so you cannot assume it will not pass that to a Client Component somewhere in its tree. The token gets serialized and sent to the client. Use React’s experimental **[`taintUniqueValue`](https://react.dev/reference/react/experimental_taintUniqueValue)** to mark the token as server-only. If that value is ever passed to a Client Component, React throws. To block an entire object instead of a single value, use **[`taintObjectReference`](https://react.dev/reference/react/experimental_taintObjectReference)**.

```
import { experimental_taintUniqueValue } from 'react'

async function Dashboard() {
  const user = await getUser()

  experimental_taintUniqueValue(
    'Do not pass the user token to the client.',
    user,
    user.token
  )

  return <UserThemeConfig user={user} />
}
```

Sidenote: taintUniqueValue blocks user.token from being sent to the client

If that component’s code (or a future refactor by someone else on the team) tries to pass `user.token` to a Client Component, React throws with your message. Valid use case stays; the token never leaks.

## [#](#make-it-future-proof)Make It Future-Proof\*

_This is a concept to understand: be defensive. It is not a pattern to apply everywhere._

A theme that generates random accent colors on mount:

```
function ThemeProvider({ baseTheme, children }) {
  const colors = useMemo(
    () => getRandomColors(baseTheme),
    [baseTheme]
  )

  return <div style={colors}>{children}</div>
}
```

Sidenote: useMemo caches the generated colors

But `useMemo` is a [performance hint, not a semantic guarantee](https://react.dev/reference/react/useMemo#caveats). React discards cached values during HMR, and reserves the right to do so for offscreen components or features that don’t exist yet. If React discards the cache, your theme flickers to different colors. Use state when correctness depends on persistence:

```
function ThemeProvider({ baseTheme, children }) {
  const [colors, setColors] = useState(() => generateAccentColors(baseTheme))
  const [prevTheme, setPrevTheme] = useState(baseTheme)

  if (baseTheme !== prevTheme) {
    setPrevTheme(baseTheme)
    setColors(generateAccentColors(baseTheme))
  }

  return <div style={colors}>{children}</div>
}
```

Sidenote: useState provides semantic persistence guarantee

Now colors stay stable regardless of React’s internal optimizations.

---

These aren’t edge cases. They’re the new normal. The components that break? They weren’t fragile. They were built for yesterday’s React. We’re building for tomorrow’s.

---

Thanks to [Jiachi](https://huozhi.im) for **proof**\-reading.
