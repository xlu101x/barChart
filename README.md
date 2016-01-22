BarChart
========

This is a jQuery plugin that provides interactive bar chart presentation for specified user data.


## Features

- Vertical and horizontal positioning
- Toggling bar's sections in real-time
- Support of non-date keys
- Highly customizable via css
- Responsive and adaptive
- Works on mobile platforms as well as on desktop


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

## Demo 

You can test a full-working demo [here](http://canddy.ru/work/barchart/)
