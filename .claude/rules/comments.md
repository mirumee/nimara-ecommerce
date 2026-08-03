# Comments

- Comment a decision the code cannot show, not what the code says. A name, type, or
  signature that already carries the meaning needs no comment.
- Keep it to one or two lines. Provider API background belongs in the vendor's docs, not
  in a source file.
- Never annotate a constant merely because it exists.
- Never restate an architecture rule the code already follows. A derived type that names
  no provider does not need a comment saying it names no provider.
- Prefer a comment that would stop someone "fixing" correct code back to broken.
- Use the expanded block form when a comment is warranted, never `/** one liner */`.
