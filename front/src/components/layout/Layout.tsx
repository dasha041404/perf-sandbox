import { Outlet } from 'react-router-dom'

import styles from './Layout.module.css'

export function Layout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerPlaceholder}>Header placeholder</div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
