const EventEmitter = require('events')

class SingleEmit extends EventEmitter {
  constructor (eventEmitters, event) {
    super()
    if (typeof eventEmitters !== 'object' || eventEmitters === null)
      throw new Error(
        'Invalid type! The constructor expects an Array or an Object')
    if (!eventEmitters.length && !Object.keys(eventEmitters).length)
      throw new Error(
        'The constructor expects a collection of items')
    if (!event || !(typeof event === 'string' || typeof event === 'symbol'))
      throw new Error(
        'No event to listen to. See documentation')

    this.emitted = false
    if (Array.isArray(eventEmitters))
      this._handleArray(eventEmitters, event)
    else
      this._handleObject(eventEmitters, event)
  }

  _handleArray (eventEmitters, event) {
    const data = []
    let emitted = 0

    for (let i = 0; i < eventEmitters.length; i++) {
      if (!(eventEmitters[i] instanceof EventEmitter)) {
        SingleEmit._emitTypeError(this, eventEmitters[i])
        break
      }
      eventEmitters[i].once('error', (error) => {
        this._emitOnce('error', error)
      })
      eventEmitters[i].once(event, (eventData) => {
        data[i] = eventData
        emitted++
        if (emitted === eventEmitters.length)
          this._emitOnce(event, data)
      })
    }
  }

  _handleObject (eventEmitters, event) {
    const data = {}
    let emitted = 0

    const emitters = Object.keys(eventEmitters)
    if (emitters.length)
      for (let i = 0; i < emitters.length; i++) {
        if (!(eventEmitters[emitters[i]] instanceof EventEmitter)) {
          SingleEmit._emitTypeError(this, eventEmitters[emitters[i]])
          break
        }
        eventEmitters[emitters[i]].once('error', (error) => {
          this._emitOnce('error', error)
        })
        eventEmitters[emitters[i]].once(event, (eventData) => {
          data[emitters[i]] = eventData
          emitted++
          if (emitted === emitters.length)
            this._emitOnce(event, data)
        })
      }
  }

  // Only one event should be emitted
  _emitOnce (event, data) {
    if (!this.emitted) {
      this.emit(event, data)
      this.emitted = true
    }
  }
  // This method only emits errors if a member of the collection is
  // not an event emitter
  static _emitTypeError (group, item) {
    process.nextTick(() => {
      group._emitOnce('error', new Error(
        `Item is not an event emitter: ${item}`))
    })
  }
}

module.exports = SingleEmit
