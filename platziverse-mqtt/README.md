# platziverse-mqtt

## `agent/connected`

```js
{
    agent: {
        uuid, // auto generate
        username, // define in config
        name,  // define in config
        hostname, // Get from OS
        pid // Get from procesess
    }
}
```

## `agent/disconnected`

```js
{
    agent: {
        uuid
    }
}
```

## `agent/message`

```js
{
    agent,
    metrics: [{
        type,
        value
    }],
    timestamp // Generate when the message is created
}
```