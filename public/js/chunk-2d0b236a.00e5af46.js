(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d0b236a"],{"22c7":function(o,t,r){"use strict";r.r(t);var i=function(){var o=this,t=o.$createElement,r=o._self._c||t;return r("div",[r("v-row",[r("v-col",[r("p",[o._v("Показывать непустые столбцы")]),r("div",[r("v-switch",{model:{value:o.shortListHeaders,callback:function(t){o.shortListHeaders=t},expression:"shortListHeaders"}})],1)]),r("v-col",[r("p",[o._v("Отображать товары не основного ассортимента для сопоставления")]),r("v-radio-group",{model:{value:o.showNotLinkedProduct,callback:function(t){o.showNotLinkedProduct=t},expression:"showNotLinkedProduct"}},[r("v-radio",{attrs:{value:null,label:"не показывать"}}),o._l(o.providers,(function(o){return r("v-radio",{key:o.id,attrs:{value:o.id,label:o.nameProvider+" #"+o.id}})}))],2)],1)],1),o.tableInfo&&o.tableInfo.rows?r("v-data-table",{attrs:{headers:o.headers,items:o.tableInfo.rows.concat(o.tableInfo.notLinkedRows)},scopedSlots:o._u([{key:"item.id",fn:function(t){var i=t.item;return[i.id?r("div",[o._v(" "+o._s(i.id)+" ")]):r("div",[r("v-select",{attrs:{items:["New"].concat(o.mainProducts.map((function(o){return o.id}))),label:"Связать"},on:{change:function(t){o.select(t,i)}}})],1)]}}],null,!1,3933829408)}):o._e(),null!==o.error?r("div",[o._v("Error - "+o._s(o.error))]):o._e(),r("v-btn",{attrs:{color:"primary"},on:{click:o.writeRowsInExcel}},[o._v("Выгрузить в Excel")]),o._v(" 11111 ")],1)},e=[],n=r("2909"),a=r("5530"),c=(r("d81d"),r("159b"),r("caad"),r("b0c0"),r("b64b"),r("4de4"),r("99af"),r("bc3a")),d=r.n(c),s={name:"ShowAllProducts",components:{},data:function(){return{providerProducts:null,mainProducts:null,providers:null,error:null,shortListHeaders:!0,showNotLinkedProduct:null}},computed:{tableInfo:function(){var o=this;if(!this.mainProducts||!this.providerProducts||!this.providers)return null;var t=this.mainProducts.map((function(o){return o.id})),r={};t.forEach((function(o){r[o]={}}));var i=[];this.providerProducts.forEach((function(o){if(o.idMainProduct){var t=o.idMainProduct;if(r[t]||(r[t]={}),o.idProductProvider){var e="id #".concat(o.idProvider);i.includes(e)||i.push("id #".concat(o.idProvider)),r[t]["id #".concat(o.idProvider)]=o.idProductProvider}if(o.name){var n="name #".concat(o.idProvider);i.includes(n)||i.push("name #".concat(o.idProvider)),r[t]["name #".concat(o.idProvider)]=o.name}if(o.price){var a="price #".concat(o.idProvider);i.includes(a)||i.push("price #".concat(o.idProvider)),r[t]["price #".concat(o.idProvider)]=o.price}if(o.count){var c="count #".concat(o.idProvider);i.includes(c)||i.push("count #".concat(o.idProvider)),r[t]["count #".concat(o.idProvider)]=o.count}}}));var e=Object.keys(r).map((function(o){return Object(a["a"])({id:o},r[o])})),n=[];this.showNotLinkedProduct&&(n=this.providerProducts.filter((function(t){return t.idProvider===o.showNotLinkedProduct})).map((function(o){var t={};if(o.idProductProvider){var r="id #".concat(o.idProvider);i.includes(r)||i.push("id #".concat(o.idProvider)),t["id #".concat(o.idProvider)]=o.idProductProvider}if(o.name){var e="name #".concat(o.idProvider);i.includes(e)||i.push("name #".concat(o.idProvider)),t["name #".concat(o.idProvider)]=o.name}if(o.price){var n="price #".concat(o.idProvider);i.includes(n)||i.push("price #".concat(o.idProvider)),t["price #".concat(o.idProvider)]=o.price}if(o.count){var a="count #".concat(o.idProvider);i.includes(a)||i.push("count #".concat(o.idProvider)),t["count #".concat(o.idProvider)]=o.count}return t})));var c=[];return this.providers.forEach((function(o){var t=o.id;c.push("name #".concat(t)),c.push("price #".concat(t)),c.push("count #".concat(t))})),{rows:e,notLinkedRows:n,shortListHeaders:["id"].concat(i),fulllListHeaders:["id"].concat(c)}},headers:function(){if(!this.tableInfo)return null;var o=null;return o=this.shortListHeaders?this.tableInfo.shortListHeaders:this.tableInfo.fulllListHeaders,o.map((function(o){return{text:o,align:"start",value:o}}))}},mounted:function(){var o=this;console.log("MOUNTED"),this.products=null,this.error=null,d.a.get("http://localhost:3000/api/getProviderProducts").then((function(t){console.log("SUCCESS"),t&&t.data&&t.data.data&&(o.providerProducts=t.data.data)})).catch((function(){console.log("ERROR"),o.providerProducts=null})),d.a.get("http://localhost:3000/api/getMainProducts").then((function(t){console.log("SUCCESS"),t&&t.data&&t.data.data&&(o.mainProducts=t.data.data)})).catch((function(){console.log("ERROR"),o.mainProducts=null})),d.a.get("http://localhost:3000/api/getProviders",{headers:{"Content-Type":"multipart/form-data"}}).then((function(t){t&&t.data&&t.data.data&&(o.providers=t.data.data)})).catch((function(){console.log("ERROR"),o.providers=null}))},methods:{handleFileUpload:function(){this.file=this.$refs.file.files[0]},select:function(o,t){if(console.log(o),console.log(t),!this.showNotLinkedProduct)return"error";var r=t["id #".concat(this.showNotLinkedProduct)],i=this.showNotLinkedProduct,e={idProductProvider:r,idProvider:i};"New"!==o&&(e.idMainProduct=o),d.a.post("http://localhost:3000/api/addLink",e,{headers:{"Content-Type":"application/json"}}).then((function(){console.log("SUCCESS"),alert("Связан")})).catch((function(){console.log("ERROR"),alert("Ошибка")}))},writeRowsInExcel:function(){d.a.post("http://localhost:3000/api/writeRowsInExcel",{headers:this.headers,rows:[].concat(Object(n["a"])(this.tableInfo.rows),Object(n["a"])(this.tableInfo.notLinkedRows))},{headers:{"Content-Type":"application/json"}}).then((function(){console.log("SUCCESS")})).catch((function(){console.log("ERROR")}))}}},l=s,u=r("2877"),v=r("6544"),h=r.n(v),p=r("8336"),f=r("62ad"),P=r("8fea"),m=r("67b6"),w=r("43a6"),b=r("0fd9"),R=r("b974"),k=r("b73d"),L=Object(u["a"])(l,i,e,!1,null,null,null);t["default"]=L.exports;h()(L,{VBtn:p["a"],VCol:f["a"],VDataTable:P["a"],VRadio:m["a"],VRadioGroup:w["a"],VRow:b["a"],VSelect:R["a"],VSwitch:k["a"]})}}]);
//# sourceMappingURL=chunk-2d0b236a.00e5af46.js.map