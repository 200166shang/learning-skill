# V7 workflow cases

1. From IDLE, a learner asks a top-level question: start one Episode and one root question.
2. AI notices a possible gap but learner does not accept it: do not persist or PUSH it.
3. Learner accepts a blocking child: append it to the active Episode and PUSH its ID.
4. Child answer is uncertain: record evidence and keep it open.
5. Child connection passes: persist evidence, close child, POP, and explicitly reconnect the parent arrow.
6. Root teach-back passes: persist evidence, close root and Episode, enter IDLE, and stop.
7. OVERVIEW lists a boundary after closure: do not start another Episode.
8. Learner asks what to study next: offer a few candidates without persisting any.
9. Review of a closed question fails: record review evidence without mutating historical closure.
10. Learner chooses to relearn after review failure: start a new Episode that may reference the old question.
11. A misconception is hypothesized by the AI but not expressed: do not record it.
12. A resumed active Episode has stale conversational context: begin with one small retrieval check.
