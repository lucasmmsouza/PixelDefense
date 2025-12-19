export const TOWER_TYPES = {
  ARCHER: {
    id: 'ARCHER',
    name: "Arqueiro",
    icon: "🏹",
    cost: 70,
    range: 144,
    damage: 5,
    rate: 500,
    color: '#d35400',
    type: 'ranged'
  },
  MAGE: {
    id: 'MAGE',
    name: "Mago",
    icon: "⚜️",
    cost: 90,
    range: 120,
    damage: 2,
    rate: 1000,
    slowFactor: 0.5,
    slowDuration: 2000,
    color: '#8e44ad',
    type: 'magic'
  },
  BOMB: {
    id: 'BOMB',
    name: "Canhão",
    icon: "💣",
    cost: 110,
    range: 120,
    damage: 8,
    rate: 2000,
    aoe: 60,
    color: '#2c3e50',
    type: 'area'
  },
  BARRACKS: {
    id: 'BARRACKS',
    name: "Quartel",
    icon: "🛡️",
    cost: 90,
    range: 96,
    respawnRate: 10000,
    color: '#7f8c8d',
    type: 'barracks'
  }
};
