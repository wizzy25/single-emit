const EventEmitter = require('events')
const SingleEmit = require('../src/main')

describe('SingleEmit', () => {
  let event1
  beforeEach(() => {
    event1 = new EventEmitter()
  })

  describe('constructor', () => {
    it('throw if first argument is not an array or object', () => {
      expect(() => new SingleEmit('string')).toThrowError(/Invalid type!/)
    })

    it('throw if first argument is an empty array', () => {
      expect(() => new SingleEmit([])).toThrowError(/expects a collection/)
    })

    it('throw if first argument is an empty object', () => {
      expect(() => new SingleEmit({})).toThrowError(/expects a collection/)
    })

    it('throw if second argument is not a string or empty', () => {
      expect(() => new SingleEmit([event1])).toThrowError(/No event to listen/)
    })

    it('throw if second argument is not a string or empty', () => {
      expect(() => new SingleEmit([event1], '')).toThrowError(/No event/)
    })

    it('returns an instance of event emitter', () => {
      const event1 = new EventEmitter()
      const singleEmit = new SingleEmit([event1], 'test')
      expect(singleEmit).toBeInstanceOf(EventEmitter)
    })
  })

  describe('handleArray', () => {
    let event1
    let event2
    let event3
    let singleEmit
    beforeEach(() => {
      event1 = new EventEmitter()
      event2 = new EventEmitter()
      event3 = new EventEmitter()
      singleEmit = new SingleEmit([event1, event2, event3], 'test')
    })

    it('should be a function', () => {
      expect(typeof singleEmit._handleArray).toBe('function')
    })

    it('take array of event emitters and emit single event', (done) => {
      singleEmit._handleArray([event1], 'test')
      singleEmit.on('test', () => {
        done()
      })
      event1.emit('test')
    })

    it('should emit error on the first error emitted', (done) => {
      singleEmit._handleArray([event1, event2], 'test')
      singleEmit.on('error', (error) => {
        expect(error.message).toMatch(/Only this event should be fired/)
        done()
      })

      event1.emit('test', 'This should not be returned')
      event2.emit('error', new Error('Only this event should be fired'))
    })

    it('throw error if an item is not an event emitter', (done) => {
      singleEmit._handleArray([event1, 'notAnEvent'], 'test')
      singleEmit.on('error', (error) => {
        expect(error.message).toMatch(/Item is not an event emitter/)
        done()
      })
    })

    it('records only the first occurence of an event', (done) => {
      singleEmit._handleArray([event1, event2], 'test')
      singleEmit.on('test', (data) => {
        expect(data.length).toBe(2)
        expect(data[0]).toBe('I am the first event')
        expect(data[1]).toBe('I am the second event')
        done()
      })
      event1.emit('test', 'I am the first event')
      event1.emit('test', 'I am the first event again so I am ignored')
      event2.emit('test', 'I am the second event')
    })

    it('take array of emitters and emit single event in order', (done) => {
      singleEmit._handleArray([event1, event2, event3], 'test')
      singleEmit.on('test', (data) => {
        expect(data.length).toBe(3)
        expect(data[0]).toBe('Emitted second but first in Array')
        expect(data[1]).toBe('Emitted third but second in Array')
        expect(data[2]).toBe('Emitted first but third in Array')
        done()
      })
      event3.emit('test', 'Emitted first but third in Array')
      event1.emit('test', 'Emitted second but first in Array')
      event2.emit('test', 'Emitted third but second in Array')
    })
  })

  describe('handleObject', () => {
    let event1
    let event2
    let singleEmit
    beforeEach(() => {
      event1 = new EventEmitter()
      event2 = new EventEmitter()
      singleEmit = new SingleEmit({ event1, event2 }, 'test')
    })

    it('should be a function', () => {
      expect(typeof singleEmit._handleObject).toBe('function')
    })

    it('take an object of event emitters and emit single event', (done) => {
      singleEmit._handleObject({ event1 }, 'test')
      singleEmit.on('test', () => {
        done()
      })
      event1.emit('test')
    })

    it('throw error if an item is not an event emitter', (done) => {
      singleEmit._handleObject([event1, 'notAnEvent'], 'event')
      singleEmit.on('error', (error) => {
        expect(error.message).toMatch(/Item is not an event emitter/)
        done()
      })
    })

    it('should emit error on the first error emitted', (done) => {
      singleEmit._handleObject({ event1, event2 }, 'test')
      singleEmit.on('error', (error) => {
        expect(error).toMatch(/Only this event should be fired/)
        done()
      })
      event1.emit('test', 'This should not be returned')
      event2.emit('error', 'Only this event should be fired')
    })

    it('throw error if an item is not an event emitter', (done) => {
      singleEmit._handleArray([event1, 'notAnEvent'], 'test')
      singleEmit.on('error', (error) => {
        expect(error.message).toMatch(/Item is not an event emitter/)
        done()
      })
    })

    it('records only the first occurence of an event', (done) => {
      singleEmit._handleObject({ event1, event2 }, 'test')
      singleEmit.on('test', (data) => {
        expect(data.event1).toBe('I am the first event')
        expect(data.event2).toBe('I am the second event')
        done()
      })
      event1.emit('test', 'I am the first event')
      event1.emit('test', 'I am the first event again so I am ignored')
      event2.emit('test', 'I am the second event')
    })
  })
})
