const { test } = require('tap')
const eventHandler = require('../index')

const { handleEvent } = eventHandler({
  projectionRepositories: {
    foo: {
      getById: id => Promise.resolve({ 
        version: 2,
        state: { id, foo: 'bar' },
        save: events => Promise.resolve({ id, events }),
      }),
    },
  },
  eventRepositories: {
    foo: {
      parseEvent: payload => payload,
      loadEvents: id => Promise.resolve([ 'event1', 'event2', 'event3' ]),
    },
  },
})

test('handleEvents', async assert => {
  const event = {
    id: '123',
    version: 2,
    events: [ 'event1', 'event2' ],
  }
  
  const expected = {
    id: '123',
    events: [ 'event1', 'event2' ],
  }

  const res = await handleEvent(event)

  assert.deepEquals(res, expected, 'saves new events for entity')
})

test('handleEvents - inconsecutive', async assert => {
  const event = {
    id: '123',
    version: 3,
    events: [ 'event3' ],
  }
  
  const expected = {
    id: '123',
    events: [ 'event1', 'event2', 'event3' ],
  }

  const res = await handleEvent(event)

  assert.deepEquals(res, expected, 'fetches missing events from repo and saves them all')
})