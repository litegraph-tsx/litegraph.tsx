
# Roadmap

## Catch-up (0.5)

- [x] Confirmed pnpm replaces npm successfully.  If the team agrees, we can remove package-lock.json

- [ ] Move eslint.config.js into tools and still have it work
    Sluffing fix to "whenever"

- [x] Implement airbnb eslint stylistic rules, 0 strictness to start.

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

- [x] Shunt migration of ES6 classes along with version so calls to constructors doesn't bomb adopter's code

## ES6 Class Step (0.7)

- [x] Enable ES6 classes in LiteGraph

- [x] Automated class conversion using lebab

- [x] Manual class conversion and movement of methods and properties into classes

- [x] Clean up global.X, LiteGraph.X class attachments

- [x] Ensure all cases of previously globally available methods are bound to LiteGraph.method()

- [x] Ensure all of the previously global variables are in the correct module.

- [x] node/Math.js and length bug fixes

- [x] Migration of getters and setters to ES6 form

- [x] Split litegraph.js into class files

## Debugger and Test Step (0.8)

- [x] Implemented Console.js, which allows setting level dynamically and can be imported into a local variable console without affecting same globally.

- [x] Replace all commented out debug calls with use of console.

- [ ] Figure out and implement categorization mechanism for messages "I want a higher console level for stuff involving pointer events?"

- [ ] Deprecate LiteGraph.debug boolean in favor of console mechanism by implementing a console.trace() on get/set.

- [ ] Establish tests for code functionality using browser hooks and visible indications

## TypeScript and AirBnB (0.9)

- [ ] TypeScript passes in core with reasonably non-specific but non-any types

- [ ] AirBnB passes for things that lint:fix automatically and things that may cause actual bugs

## Stabilization and Manual Testing of State (1.0)

This is our first release, and an upgrade to 2016 as a bare minimum for LiteGraph variants.  Anyone running pre-2016 will be able to follow these footsteps to catch up to that year, providing a pathway out of legacy.

- [ ] Determine what our breadcrumb commits are that adopters can stop at, take a breather, and implement changes to catch up.  Set those up as such.

- [ ] Take some time to test out each of the features and see if we're okay with things before releasing it as 1.0

- [ ] Round table a new ROADMAP for next release.
