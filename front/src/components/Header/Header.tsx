import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import styles from './Header.module.css'
import { LogoIcon } from '../../assets'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
            <LogoIcon className={styles.logo} aria-hidden="true" focusable="false" />
          <h1 className={styles.title}>Template Engine Performance Sandbox</h1>
        </div>

        <nav aria-label="Main navigation" className={styles.navigation}>
          <NavLink
            to={ROUTES.EXPERIMENT}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.linkActive : ''}`
            }
            end
          >
            Experiment
          </NavLink>
          <NavLink
            to={ROUTES.RESULTS}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.linkActive : ''}`
            }
          >
            Results
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
