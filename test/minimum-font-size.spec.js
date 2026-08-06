const { test, expect } = require('@playwright/test')
const fs = require('fs')
const path = require('path')

const sourceRoot = path.resolve(__dirname, '../src')
const sourceExtensions = new Set(['.css', '.html', '.js'])

const sourceFiles = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const entryPath = path.join(directory, entry.name)
  if (entry.isDirectory()) return sourceFiles(entryPath)
  return sourceExtensions.has(path.extname(entry.name)) ? [entryPath] : []
})

test('production sources use no explicit font size below 13 pixels', () => {
  const violations = []
  const declaration = /(?:\bfont-size|--[\w-]*font-size[\w-]*)\s*:\s*([^;\n]+)/g

  for (const file of sourceFiles(sourceRoot)) {
    const source = fs.readFileSync(file, 'utf8')
    for (const match of source.matchAll(declaration)) {
      const pixelValues = Array.from(match[1].matchAll(/(\d+(?:\.\d+)?)px/g), value => Number(value[1]))
      for (const value of pixelValues) {
        if (value < 13) violations.push(`${path.relative(sourceRoot, file)}: ${match[0].trim()}`)
      }
    }
  }

  expect(violations).toEqual([])
})
