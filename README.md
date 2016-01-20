BarChart
========

This is a jQuery plugin that provides interactive bar chart presentation for specified user data.

---

## Features

- vertical and horizontal positioning
- toggling bar's sections in real-time
- support of non-date keys
- highly customizable via css


## Demo 

You can test a full-working demo at http://canddy.ru/work/barChart/

## Setup

```javascript
$('selector').barChart({
  vertical : true,
  height: 500,
  bars : [
    {
      name : 'Example',
      values : [ [ key, value ], [ key, value ], ... ]
    },
    ...
  ]
});
```
