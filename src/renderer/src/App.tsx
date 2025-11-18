import { useState } from 'react'
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  const [response, setResponse] = useState<string>('')

  const handleGetInfo = async (): Promise<void> => {
    const info = await window.api.app.getAppInfo({
      includeVersions: true,
      includePlatform: true
    })
    const message = `App: ${info.appName}\nPlatform: ${info.platform}\nElectron: ${info.versions?.electron}`
    setResponse(message)
    console.log('App info:', info)
  }

  const handleCalculate = async (): Promise<void> => {
    const result = await window.api.app.calculate({
      operation: 'multiply',
      a: 7,
      b: 6
    })
    setResponse(result.expression)
    console.log('Calculation:', result)
  }

  const handleGreet = async (): Promise<void> => {
    const greeting = await window.api.app.greetUser({
      name: 'Developer',
      timeOfDay: 'morning'
    })
    setResponse(greeting.greeting)
    console.log('Greeting:', greeting)
  }

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={handleGetInfo}>
            Get App Info
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={handleCalculate}>
            Calculate 7 × 6
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={handleGreet}>
            Greet User
          </a>
        </div>
      </div>
      {response && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            background: '#222',
            color: '#fff',
            borderRadius: '5px',
            whiteSpace: 'pre-line'
          }}
        >
          <strong>Response:</strong> {response}
        </div>
      )}
      <Versions></Versions>
    </>
  )
}

export default App
