import React from 'react'
import two from './two'
import styles from './styles/one.css'

export default class One extends React.PureComponent {
  componentDidMount() {
    two()
  }

  render() {
    return <button className={styles.button}>Click me</button>
  }
}
