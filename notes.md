# notes taken during plane from sfo

* what is the future of augmentedgesture.js
* what remain to be done ? in which field ? the fields seem to be:
  * code
  * examples
  * communication
* What about the structure of the code
  * currently the code is hardcoded with 2 pointers
  * not good to be hardcoded
  * a single pointer is a very valid usecase, one pointer in one hand
  * 10 pointers, one per finger is a very valid case too
  * So the pointer must be configurable
  * handle that in dat.gui too
* code the minimal value for marker too
* which kind of marker are possible
  * anything kindof round with a flashy distinctive color

# event refactoring
* from a code point of view, change it to mouseup, mousedown, mousemove ?
  * and do that for each pointer
* maybe to provide the same value as in touch event
  * it has multiple events like touch
  * ask paul panserrieu about touch event structure
* maybe to provide both ?
* one things is different from touch event
  * one can konw which finger is touching
* so in fact this is like many mouse at the same time

# examples
* find good examples
* what is a good example
* some super simple examples for educational purpose
* some link with various possibilities
  * link to be an actual mouse pointer
* is that possible to simulate mouse pointer from javascript ?

## ideas of example
* link with $1 gesture recognition seems a cool test
* a extension chrome where i navigate page ?
* find some actual case which can be reused externally
* a way to navigate slides ?
  * nice for demo











