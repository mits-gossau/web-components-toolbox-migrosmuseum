const { devices } = require('@playwright/test')

const executablePath = process.env.PLAYWRIGHT_CHROME_PATH

module.exports = {
  testDir: './test',
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:2200',
    headless: true,
    ...devices['Desktop Chrome'],
    launchOptions: executablePath ? { executablePath } : {}
  },
  webServer: {
    command: './node_modules/.bin/live-server --port=2200 --host=127.0.0.1 --no-browser',
    url: 'http://127.0.0.1:2200',
    reuseExistingServer: true
  }
}
