export const LEVELS = [
  {
    id: 1,
    path: [{x:0, y:100}, {x:200, y:100}, {x:200, y:400}, {x:500, y:400}, {x:500, y:200}, {x:800, y:200}],
    spots: [
      {x:100, y:50}, {x:100, y:150},
      {x:250, y:200}, {x:150, y:250},
      {x:350, y:350}, {x:350, y:450},
      {x:550, y:300}, {x:450, y:300},
      {x:650, y:150}, {x:650, y:250}
    ],
    waves: [
      ['NORMAL', 'NORMAL', 'NORMAL'],
      ['NORMAL', 'FAST', 'NORMAL'],
      ['TANK', 'NORMAL', 'TANK']
    ]
  },
  {
    id: 2,
    path: [{x:0, y:300}, {x:800, y:300}],
    spots: [{x:400, y:200}, {x:400, y:400}],
    waves: [['FAST', 'FAST', 'FAST']]
  }
];
