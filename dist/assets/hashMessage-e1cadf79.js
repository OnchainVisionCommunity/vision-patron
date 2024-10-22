import{fD as e,fE as a,fF as i,cC as o}from"./index-3b8711e5.js";const f=`Ethereum Signed Message:
`;function u(t,n){const r=(()=>typeof t=="string"?e(t):t.raw instanceof Uint8Array?t.raw:a(t.raw))(),s=e(`${f}${r.length}`);return i(o([s,r]),n)}export{u as hashMessage};
