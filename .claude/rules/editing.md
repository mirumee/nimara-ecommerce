# Editing existing code

- Never revert an edit the user made. Their version is the current state, formatting
  included.
- Prefer targeted edits. Rewriting a whole file silently restores everything the user
  changed since you last read it.
- Re-read a file before rewriting it. The working tree moves between your turns.
- A user change that looks inconsistent is not a mistake to clean up. Ask before touching
  it, and say what you would change.
- Never discard uncommitted work to reach a clean state. `git checkout --`, `git restore`,
  `git reset --hard`, and `git stash` destroy edits the user may have made since your last
  read, and the loss is silent. Ask first, every time.
- If you do overwrite, revert, or discard something the user changed, say so plainly in
  your reply. Correcting it quietly hides the loss until they go looking for it.
