import{_ as u,br as p,bs as m,bt as d,bu as l,bv as g,eD as w}from"./index-3b8711e5.js";import{InjectedConnector as f}from"./thirdweb-dev-wallets-evm-connectors-injected.browser.esm-dbd6eb58.js";class y extends f{constructor(t){const s={...{name:"Magic Eden",shimDisconnect:!0,shimChainChangedDisconnect:!0,getProvider:w},...t.options};super({chains:t.chains,options:s,connectorStorage:t.connectorStorage}),u(this,"id",p.magicEden)}async connect(){var c,s;let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};try{const e=await this.getProvider();if(!e)throw new m;this.setupListeners(),this.emit("message",{type:"connecting"});let n=null;if((c=this.options)!=null&&c.shimDisconnect&&!this.connectorStorage.getItem(this.shimDisconnectKey)&&(n=await this.getAccount().catch(()=>null),!!n))try{await e.request({method:"wallet_requestPermissions",params:[{eth_accounts:{}}]})}catch(h){if(this.isUserRejectedRequestError(h))throw new d(h)}if(!n){const o=await e.request({method:"eth_requestAccounts"});n=l(o[0])}let i=await this.getChainId(),r=this.isChainUnsupported(i);if(t.chainId&&i!==t.chainId)try{await this.switchChain(t.chainId),i=t.chainId,r=this.isChainUnsupported(t.chainId)}catch(o){console.error(`Could not switch to chain id : ${t.chainId}`,o)}(s=this.options)!=null&&s.shimDisconnect&&await this.connectorStorage.setItem(this.shimDisconnectKey,"true");const a={chain:{id:i,unsupported:r},provider:e,account:n};return this.emit("connect",a),a}catch(e){throw this.isUserRejectedRequestError(e)?new d(e):e.code===-32002?new g(e):e}}}export{y as MagicEdenConnector};
