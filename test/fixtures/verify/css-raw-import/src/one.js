import React from 'react'
import two from './two'
import styles from './styles/One.css?raw'

export default class One extends React.PureComponent {
  componentDidMount() {
    two()
  }

  render() {
    return <button className={styles.button}>Click me</button>
  }
}
