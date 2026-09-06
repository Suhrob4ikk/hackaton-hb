import logoModel from '../../assets/logoModel.png'
import styles from './HeroModel.module.css'

function HeroModel() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <img className={styles.image} src={logoModel} alt="" />
    </div>
  )
}

export default HeroModel
