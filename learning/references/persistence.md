# Persistence

Before writing, search relevant `notes/**/*.md` by concept, mechanism, tags, and likely vocabulary. Reconcile the candidate durable knowledge with what exists:

- **Reuse:** an existing note already expresses the concept at the needed scope. Keep it unchanged and add its path to the Journey question's `note_refs`.
- **Revise:** an existing note has the same concept identity and the new learning corrects or completes that scope. Revise it in place and preserve its stable path.
- **Create:** the concept has independent long-term value and adding it to an existing note would mix scopes. Create one KnowledgeNote and reference it from Journey.

One Journey question may reference several notes; several Journey questions may reference one note. An answered question may also have `note_refs: []` when no durable note is warranted.

Use the shared LearningRecord contract. New notes use only semantic relations supported there. Learning provenance belongs in Journey, so new writes leave `derived-from` to legacy compatibility.
