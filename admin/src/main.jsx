import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  componentDidCatch(error) {
    this.setState({ error: error.message })
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', background: '#1a1a2e', color: 'white', minHeight: '100vh' }}>
          <h2 style={{ color: '#C4622D' }}>Error Found:</h2>
          <pre style={{ color: '#ff6b6b', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
            {this.state.error}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)