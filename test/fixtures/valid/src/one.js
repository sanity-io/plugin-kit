import React from 'react'
import two from './two'
import styles from './one.css'

export default class Foo extends React.PureComponent {
  // plugin-proposal-class-properties
  state = {i: 0}

  // plugin-proposal-class-properties
  handleClick = () => {
    this.setState((prev) => ({i: prev.i + 1}))
  }

  componentDidMount() {
    two()
  }

  render() {
    return (
      <button className={styles.button} onClick={this.handleClick}>
        {i % 0 === 0 ? 'Foo!' : 'Bar!'}
      </button>
    )
  }
}
