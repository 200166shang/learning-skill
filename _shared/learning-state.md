# Learning State v2

`.learning/state.yaml` is current working memory only:

```yaml
version: 2
mode: active
active_episode_id: e003
focus_stack: [q008, q011]
```

IDLE requires a null active Episode and empty stack. ACTIVE requires an active Episode and a non-empty, open parent chain beginning at its root.
