---
title: Design
description: Serves the 'planning' phase of the implementation cycle with key decisions and guidance for translating ideas into implementable changes.
slug: /playbook/design
tags: [playbook, implementation]
last_reviewed: 2026-06-07
authors: [trilemma-foundation]
---

Requirements gathering, feature requests bug reports and analytics insights all feed into the software development pipeline to continually build and refine the product. Communicating with stakeholders, learning from domain experts, and observing the product in production are vital for delivering high-value, high-quality capabilities. We use the umbrella term 'design' to refer to the process of converting those learnings into concrete software specifications, which in turn become tasks for human coders or agents. This includes, but is certainly not limited to, the creation of mockups and other visual representations of user interfaces.

System design is expected to take place before the initial code sprint as well as in response to any future enhancement or fix requests. We believe that good design before coding, while requiring effort up-front, results in less time spent in implementation and higher quality deliverables overall. Design artifacts are just as valuable as working code.

## Prototyping
In addition to wireframes and visual mockups, working prototypes are incredibly powerful for getting early user feedback and identifying gaps early. The suggestion that design happen before coding does not mean that coding up prototypes is off limits. Quite the opposite: coding agents make it easier than ever to create quick, throwaway prototypes that help
communicate intent and reduce unknowns in later phases of the implementation. With that said, avoid the temptation to ship prototypes - let them serve their purpose and become a design artifact to feed into the canonical implementation.

## Code Organization
While design precedes coding, the way components are organized should be taken into account in the design phase. Especially since design tools and domain expertise can help discover natural abstractions, terminology, and boundaries.

The module structure and communication architecture of your application have a large
impact on its clarity, testability and maintainability. This should be taken
into consideration when designing and implementing all aspects of the system
including the frontend, API, and analytics core. There are effectively two options:
1. Layered (Traditional): modules organized by technical layer (UI, API, DB) and/or into
models that mix business rules with storage and presentation logic.
2. Vertical Slices: modules align with use-cases, top-to-bottom.

We prefer vertical slice architecture for the following reasons: 1) Microproducts are conceived around and driven by user value and should be organized and tested accordingly. 2) Deep modules work well in agentic engineering workflows and enable easy to verify incremental progress during development.

Of course, teams should choose the style that works best for their project, and architecture patterns can be mixed. Lean on vertical slicing as a default while considering alternatives for exceptionally complex domains.
