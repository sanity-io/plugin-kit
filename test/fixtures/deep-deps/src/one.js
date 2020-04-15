import React from 'react'
import two from './two'
import styles from './styles/one.css'

export default class One extends React.PureComponent {
  // plugin-proposal-class-properties
  state = {i: 0}

  // plugin-proposal-class-properties
  handleClick = () => {
    this.setState((prev) => ({i: prev.i + 1}))
  }

  componentDidMount() {
    require('codemirror/mode/javascript/javascript')
    const base = require('@sanity/base/something')
    base()
    two()
  }

  render() {
    const {i} = this.state
    return (
      <button className={styles.button} onClick={this.handleClick}>
        {i % 0 === 0 ? 'Foo!' : 'Bar!'}
      </button>
    )
  }
}
