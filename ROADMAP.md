
# Roadmap

## Catch-up (0.5)

- [x] Confirmed pnpm replaces npm successfully.  If the team agrees, we can remove package-lock.json

- [ ] Move eslint.config.js into tools and still have it work
    Sluffing fix to "whenever"

- [x] Implement PRs

- [x] Correctly apply `reversion` commits from github.com/daniel-lewis-ab/litegraph.js without borking git history

## Modularization Step (0.6)

- [x] Switch Project to type:"module"

- [x] Set imports and exports and window.* are present/shunted.

- [x] Port litegraph.test.js forward to modules (depends on litegraph already being so)

- [x] Provide a safe transition stage that doesn't harass

- [x] Provide a harassment stage to remove globals by using console.warn in getters

- [x] Remove IIFE

- [x] Clean up internal issues raised by upgradeShunt.js

- [x] Shifted build over to vite, and drop espresso

- [ ] Split litegraph.js into class files

## ES6 Class Step (0.7)

- [ ] Enable ES6 classes in LiteGraph

- [ ] Notify migration of ES6 classes along with version as it affects 3 spots in ComfyUI for ContextMenu

- [ ] Automated class conversion using lebab

- [ ] Manual class conversion and movement of methods and properties into classes

- [ ] node/Math.js and length bug fixes

- [ ] Migration of getters and setters to ES6 form

## Debugger and Test Step (0.8)

- [ ] Implement a Debug class, such that method calls are to be Condition Chained on level/target

- [ ] Replace all commented out debug calls with Condition Chained method calls on the Debug class

- [ ] Establish tests for code functionality using browser hooks and visible indications

## Make decision on PRs

These ones are not simple bugfixes, so warrant some discussion before pulling:

1. `Move properties panel from double click to menu option.` https://github.com/jagenjo/litegraph.js/commit/adbbc53fa4dc60cb9073c8061fdc631a4934ce15

2. `Add back roundRect so firefox ESR can work again.` https://github.com/jagenjo/litegraph.js/commit/864d0f1270b99de8e01c0d7c59bed3b80d63f793

3. `Increase maximum number of nodes to 10k.`
https://github.com/jagenjo/litegraph.js/commit/6a0e0124751e433dc17cbbddb414308f017a9594

4. `Show node title in search and also search title`
https://github.com/jagenjo/litegraph.js/commit/5925961fa15f41dcf8f8265d051785b83b126645

