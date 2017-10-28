# Single-emit
Small super light-weight concise module with no dependencies to listen for events on an [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) instance and emit a single event when all events have been emitted. Think of it as a `Promise.all`, but for events.
With support for Objects and Arrays

## How it works
`npm install --save single-emit`

```js
const fs = require('fs')
const EmitOnce = require('single-emit')

const myObjectOfStreams = {
  stream1: fs.createReadStream('./myFile1.txt'),
  stream2: fs.createReadStream('./myFile2.txt'),
  stream3: fs.createReadStream('./myFile3.txt'),
}

// listen for the 'end' event
const emitOnce = new EmitOnce(myObjectOfStreams, 'end')

emitOnce.on('end', () => {
  // All streams have emitted the 'end' event
})

```
If you expect your events to fire with data, the collection of data is passed to the callback as an array or an object. If the collection of events is an array, the data passed to the callback is in the same order as the array passed in, **not in the order the events were emitted**. If the collection is an object, the data is simply mapped to the keys of the object.

For another contrived example:

```js
const fs = require('fs')
const EmitOnce = require('single-emit')

const stream1 = fs.createReadStream('./myFile1.txt')
const stream2 = fs.createReadStream('./myFile2.txt')
const stream3 = fs.createReadStream('./myFile3.txt')

const myArrayOfStreams = [stream1, stream2, stream3]

const emitOnce = new EmitOnce(myArrayOfStreams, 'data')

emitOnce.on('data', (data) => {
  // All streams have emitted the 'data' event once
  // `data` contains an array of data from the streams
  console.log(data[0]) // -> stream1 data
  console.log(data[1]) // -> stream2 data
  console.log(data[2]) // -> stream3 data
})
```

## Important
Events are only recorded the first time they are emitted so in the example above, only the first data event on each stream will be recorded

## Errors
Certain errors will be thrown and others will be emitted. If an event emitter emits an error, the error will be emitted as well, so it's a good idea to listen for errors. Also, if a value in the collection is not an instance of the Event emitter, an error will be emitted.
Other errors like passing in an invalid collection of event emitters or not passing an event to listen for will throw an error.

## API
- The constructor accepts two required arguments:
  - `collection`: A collection of event emitters which could be an array of or an object
  - `event`: The event to listen for. This could be any `string` or `Symbol`. Note that if you listen for the error event, this would be emitted once any item emits an error and does not wait on others.

## Contributing
Tests are written with Jest. Issues and pull requests are always welcome :-)
