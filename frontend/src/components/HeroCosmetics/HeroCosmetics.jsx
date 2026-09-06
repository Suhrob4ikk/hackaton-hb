import cosmeticLogo from '../../assets/cosmeticLogo.png'
import styles from './HeroCosmetics.module.css'

function HeroCosmetics() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <img className={styles.image} src={cosmeticLogo} alt="" />
    </div>
  )
}

export default HeroCosmetics
