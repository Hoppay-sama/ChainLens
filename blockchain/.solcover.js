module.exports = {
  // Include json-summary so the CI threshold check can read coverage/coverage-summary.json
  istanbulReporter: ['html', 'lcov', 'text', 'json', 'json-summary'],
}
