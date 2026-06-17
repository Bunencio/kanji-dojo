/**
 * One-step "ship": stage everything, commit, and push to GitHub.
 * Pushing triggers the GitHub Actions workflow, which redeploys the website.
 *
 *   npm run ship                 # commit with an automatic message
 *   npm run ship -- "fix typo"   # commit with your own message
 */
import { execSync } from 'node:child_process'

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })
const quiet = (cmd) => execSync(cmd, { stdio: 'pipe' }).toString().trim()

const SITE = 'https://bunencio.github.io/kanji-dojo/'

function main() {
  // Build a default message like "update 2026-06-16 14:30" when none is given.
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const message = process.argv.slice(2).join(' ').trim() || `update ${stamp}`

  run('git add -A')

  // Commit only if something is staged.
  let hasStaged = true
  try {
    execSync('git diff --cached --quiet') // exit 0 → nothing staged
    hasStaged = false
  } catch {
    hasStaged = true
  }

  if (hasStaged) {
    run(`git commit -m ${JSON.stringify(message)}`)
  } else {
    console.log('• No file changes to commit.')
  }

  // Push if there is anything ahead of origin (new commit, or a prior unpushed one).
  const ahead = quiet('git rev-list --count origin/main..HEAD || echo 0')
  if (Number(ahead) > 0) {
    run('git push origin HEAD')
    console.log(`\n✅ Pushed to GitHub. The website auto-deploys in ~1–2 min:\n   ${SITE}`)
  } else {
    console.log('• Nothing to push — GitHub is already up to date.')
  }
}

try {
  main()
} catch (err) {
  console.error('\n✗ Ship failed:', err.message)
  process.exit(1)
}
