Task: find the implicit state machines in this project.

Study the original requirements, the code and real call sites. Separate reachable scenarios and proven defects from assumptions.

First, check whether the process itself can be simplified: remove unnecessary transitions, constrain conflicting operations, clarify a contract or adjust the boundaries of responsibility. Enforce constraints at the owner of the operation. Preserve necessary concurrency.

Find the most natural way to express the states and transitions for this case, considering the language, existing architecture and libraries. Choose the smallest sufficient implementation: derived values, existing mechanisms or an explicit state machine. Let the problem determine the pattern. Give each fact one owner, without duplicate statuses or unnecessary synchronisation. A state machine is a means of simplification, not a required outcome.

Show the proposed model, what it replaces and what can be deleted. Check it against real scenarios involving success, failure, concurrency and changes of context. Account for an unknown outcome where one is possible. Identify behaviour changes separately. Present the design and verification criteria first, without implementing it.
