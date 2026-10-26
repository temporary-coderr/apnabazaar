// Towns - Jaora, Raghogarh, Rajgarh etc
export const towns = [
  {name:"Jaora", type:"City", active:true},
  {name:"Raghogarh", type:"City", active:true},
  {name:"Rajgarh", type:"City", active:true},
  {name:"Bima Road", type:"Area", parent:"Jaora"},
  {name:"Bus Stand", type:"Area", parent:"Jaora"},
  {name:"Station Road", type:"Area", parent:"Jaora"}
];

// For shop form
export function getTowns(){
  return towns.filter(t=>t.type==="City").map(t=>t.name);
}
export function getAreas(city){
  return towns.filter(t=>t.parent===city).map(t=>t.name);
}
