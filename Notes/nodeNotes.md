## The NodeJS Model (My notes)
https://nodejs.org/en/about/

https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/

https://en.wikipedia.org/wiki/Node.js

https://en.wikipedia.org/wiki/Event-driven_architecture

https://en.wikipedia.org/wiki/Callback_(computer_programming)

https://devcenter.heroku.com/articles/node-concurrency

Node is an asynchronous(I/O) and event driven runtime environment. It executes Javascript and is built on Google Chrome's V8 engine.

**asynchronous**: other processing can go on during I/O (non-blocking). Node itself almost never does I/O so it never blocks unless nothing to do.

**event-driven**: execution or processing is only triggered by events. IE, messages or callbacks. Otherwise node just sleeps and waits.

I am specifically focused on Node's concurrency model. A traditional concurrency model is to use OS threads which can switch between eachother at any time. This can result in race conditions, deadlock, and inefficiences. 

Node has an **event-loop** given as a runtime construct automatically. It exits the event-loop when there is no more code to run.

### The Event Loop:

When Node starts, the first thing it does is initialize the event-loop. It then processes the input script. Then processes the event loop.

```
   ┌───────────────────────┐
┌─>│        timers         │ Executes callbacks from timers like setInterval() or setTimeout()
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │ Most callbacks handled here
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     idle, prepare     │ Used internally
│  └──────────┬────────────┘      ┌───────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │
│  │         poll          │<─────┤  connections, │ retrieve new IO events. Will block here if it has to
│  └──────────┬────────────┘      │   data, etc.  │
│  ┌──────────┴────────────┐      └───────────────┘
│  │        check          │ handles setImmediate() callbacks.
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤    close callbacks    │ socket.on(close) etc...
   └───────────────────────┘
```
(Diagram from node's website)
   
Each one of these phases has a Queue of callbacks for Node to handle. It will usually handle up to some limit of callbacks in each phase.

If between loops, Node isn't waiting for any I/O or timers, it shuts down cleanly.

**Timers

A timer is a threshold after which the callback is added to the Queue. It only provides a minimum bound.

**I/O callbacks

Handles things like TCP socket erors. Not the actual I/O.

**Poll**

Note the poll queue is where connections and all I/O events come from.

Two Functions:
1. Execute script for timer threshold that passed
2. Process events on poll queue

When entering poll phase with no timers scheduled:

If queue not empty: Handle all events in it synchronously until empty or limit reached

If queue empty, check if anything scheduled for setImmediate. If so, go to check phase, otherwise wait for callbacks and execute them immediately.

Once poll queue empty, check timers, and if any ready, loop back to timers phase.

**Check**

Execute callback right after poll phase. setImmediate is a special timer that schedules callbacks to execute after poll. Will always execute before any timers.

**process.nextTick()**

nextTickQueue processed between each layer of event-loop. Whenever you call nextTick, all callbacks in its queue will be processed before continuing. Allows you to call function in an ordered way to make sure all variables there.

"We recommend developers use setImmediate() in all cases because it's easier to reason about (and it leads to code that's compatible with a wider variety of environments, like browser JS.)"

Only use nextTick if you want immediate action, like listening on a port instantly, so that connection isnt missed between Queueing and Check phase.

### Scaling Node

Single threaded so doesn't autoscale to multiple cores. 

Memory limit of only 1.5gb!

Way of scaling is to fork multiple processes, called "clustering".

clusters share server ports (Masters and workers)

Two methods of distributing connections:

1. (Default) Round Robin: Master listens, accepts, and distributes to workers using round robin + smarts to avoid overloading
2. Master creates listen socket and sends it to interested workers. Should work best, but OS scheduling randomness makes it work poorly.


