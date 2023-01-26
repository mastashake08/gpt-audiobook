(function(){"use strict";var t={7192:function(t,e,o){var n=o(7195),r=function(){var t=this,e=t._self._c;return e("div",{attrs:{id:"app"}},[e("img",{attrs:{alt:"GPT Audiobook logo",height:"256px",width:"256px",src:o(7383)}}),e("span",[t.loading?e("h2",[t._v(" Generating AI Short Story")]):e("h2",[t._v(" AI Generated Audiobooks ")]),e("Adsense",{staticStyle:{display:"block"},attrs:{"data-ad-client":"ca-pub-7023023584987784","data-ad-slot":"2698286691","data-ad-format":"auto","data-full-width-responsive":"true"}})],1),e("br"),e("div",[e("label",{attrs:{for:"genre-select"}},[t._v("Type A Genre")]),e("br"),e("input",{directives:[{name:"model",rawName:"v-model",value:t.genre,expression:"genre"}],attrs:{type:"text",id:"genre-select",list:"genres"},domProps:{value:t.genre},on:{input:function(e){e.target.composing||(t.genre=e.target.value)}}}),e("datalist",{attrs:{id:"genres"}},t._l(t.genres,(function(o,n){return e("option",{key:n,domProps:{value:o}},[t._v(" "+t._s(o)+" ")])})),0)]),e("br"),e("div",[e("label",{attrs:{for:"length-select"}},[t._v("Type A Story Length")]),e("br"),e("input",{directives:[{name:"model",rawName:"v-model",value:t.length,expression:"length"}],attrs:{type:"text",id:"length-select",list:"lengths"},domProps:{value:t.length},on:{input:function(e){e.target.composing||(t.length=e.target.value)}}}),e("datalist",{attrs:{id:"lengths"}},t._l(t.lengths,(function(o,n){return e("option",{key:n,domProps:{value:o}},[t._v(" "+t._s(o)+" ")])})),0)]),e("br"),e("div",[e("label",{attrs:{for:"story-prompt"}},[t._v("Seed story with a prompt, or leave blank for total AI creativity:")]),e("br"),e("textarea",{directives:[{name:"model",rawName:"v-model",value:t.userIdea,expression:"userIdea"}],attrs:{id:"story-prompt",name:"story",rows:"5",cols:"33"},domProps:{value:t.userIdea},on:{input:function(e){e.target.composing||(t.userIdea=e.target.value)}}})]),e("div",[e("label",{attrs:{for:"genre-select"}},[t._v("Select A Voice")]),e("br"),e("select",{attrs:{name:"voices",id:"voice-select"},domProps:{value:t.selectedIndex},on:{change:function(e){return t.setVoice(e)}}},[e("option",{attrs:{disabled:"",value:"-1"}},[t._v("Select Voice")]),t._l(t.voices,(function(o,n){return e("option",{key:n,domProps:{value:n}},[t._v(t._s(o.name)+" - "+t._s(o.lang))])}))],2)]),e("br"),e("div",[e("ul",[t.readyToGenerate?e("button",{on:{click:t.generateBook}},[t._v("Generate "+t._s(t.genre)+" Story")]):e("button",{on:{click:t.stopStory}},[t._v("Stop")])]),t._v(" "+t._s(this.currentBook.text)+" ")]),e("Adsense",{staticStyle:{display:"block"},attrs:{"data-ad-client":"ca-pub-7023023584987784","data-ad-slot":"2698286691","data-ad-format":"auto","data-full-width-responsive":"true"}})],1)},s=[],i=(o(7658),o(6005));class a extends EventTarget{constructor(t,e={}){super(),this.apiKey=t,this.sk=new i.Z(e),this.baseUrl="https://api.openai.com/v1/completions",this.books={},this.booksReady=!1,this.currentBook={},this.apiUrl="https://gpt-audiobook.jcompsolu.com",this.sk.getVoices()}async generateBook(t={}){try{this.dispatchEvent(new CustomEvent("storygenerating",{detail:{event:event}}));const e=await fetch(this.baseUrl,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},body:JSON.stringify(t)});this.books=await e.json(),this.booksReady=!0,console.log(JSON.parse(this.books.choices[0].text.trim())),this.currentBook=JSON.parse(this.books.choices[0].text.trim()),console.log(this.currentBook),this.dispatchEvent(new CustomEvent("storygenerated",{detail:{book:this.currentBook}}))}catch(e){console.log(e),this.booksReady=!1,this.dispatchEvent(new Event("storygeneratederror"))}}pauseStory(){this.sk.pauseSynth()}stopStory(){this.sk.getSynth().cancel()}async readStory(t){try{this.sk.addEventListener("speechkitutterancestart",(function(t){console.log(t),this.isPlaying=!0})),this.sk.addEventListener("speechkitutteranceend",(function(t){console.log(t),this.isPlaying=!1,this.dispatchEvent(new CustomEvent("storyreadended",{bubbles:!0,detail:{book:this.currentBook}}))}));const e={model:"text-davinci-003",prompt:t,temperature:.95,max_tokens:1200};if(await this.generateBook(e),!this.booksReady)throw new Error("ChatGPT is busy right now. Please try again in a few minutes!");this.dispatchEvent(new CustomEvent("storyreadstarted",{bubbles:!0,detail:{book:this.currentBook}})),this.sk.speak(this.currentBook.text),this.saveStory(this.currentBook)}catch(e){try{this.sk.speak(this.currentBook.text)}catch(e){alert(e.message),this.dispatchEvent(new Event("storyreaderror"))}}}convertToText(t){const e=t.text.replace(/<\/?[^>]+(>|$)/g,"");return e.trim()}async saveStory(t){try{if(localStorage.books){const e=JSON.parse(localStorage.books);e.push(t),localStorage.books=JSON.stringify(e)}else localStorage.books=JSON.stringify([t]);await fetch(this.apiUrl+"/api/upload-story",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:t})})}catch(e){return console.log(e),e}}}var c={name:"App",data(){return{isLoading:!1,isPlaying:!1,openAi:{},books:[],currentBook:{text:""},selectedIndex:-1,selectedVoice:{},userIdea:"",genre:"",genres:["Horror","Comedy","Love","True Crime","Sci-Fi","Fantasy","History","Action","Politics","Spirituality","Prose","Western","Legend","Erotica"],lengths:["2 sentence","1 paragraph","2 paragraph","3 paragraph","4 paragraph","5 paragraph","6 paragraph","7 paragraph","8 paragraph","9 paragraph","10 paragraph"],length:"",voices:[]}},mounted(){setTimeout((()=>{this.voices=this.openAi.sk.getVoices(),this.selectedVoice=this.voices[0]}),"1000")},async created(){const t=await fetch("https://gpt-audiobook.jcompsolu.com/api/get-key"),e=await t.json();this.openAi=new a(e.token,{pitch:.88,rate:.8}),this.openAi.addEventListener("storygenerating",(function(t){console.log(t)})),this.openAi.addEventListener("storygenerated",(function(t){this.isLoading=!1,this.currentBook=t.detail.book})),this.openAi.addEventListener("speechkitutterancestarted",(function(t){console.log(t)})),this.openAi.sk.synth.addEventListener("end",(function(t){this.isPlaying=!1,this.isLoading=!1,console.log(t)}))},computed:{readyToGenerate(){return!this.isLoading&&!this.isPlaying},loading(){return this.isLoading},playing(){return this.isPlaying},prompt(){return""!=this.userIdea?`generate a ${this.length} ${this.genre} story based on ${this.userIdea} with a title. Return a well formatted JSON object with a title property that contains the title, a text property that contains the story and ssml property that contains an well formatted SSML file prefixing <?xml version="1.0" ?> generated from the story. Serialized the JSON object as a string.`:`generate a ${this.length} ${this.genre} story with a title. Return a well formatted JSON object with a title property that contains the title, a text property that contains the story and ssml property that contains an well formatted SSML file prefixing <?xml version="1.0" ?> generated from the story. Serialized the JSON object as a string.`},storyText(){return this.currentBook.text}},methods:{setVoice(t){this.selectedIndex=t.target.value,this.selectedVoice=this.voices[this.selectedIndex],this.openAi.sk.setSpeechVoice(this.selectedVoice)},pauseStory(){this.openAi.pauseStory(),this.isPlaying=!1},stopStory(){this.openAi.stopStory(),this.isPlaying=!1,this.isLoading=!1},resumeStory(){this.openAi.resumeStory(),this.isPlaying=!0},generateBook(){const t=this;this.isLoading=!0;const e=new Promise((function(e,o){try{t.openAi.readStory(t.prompt),e()}catch(n){o(n)}}));return e.then((()=>{t.isPlaying=!0,t.isLoading=!1})).catch((()=>{t.isPlaying=!1,t.isLoading=!1})),e}}},l=c,h=o(3736),d=(0,h.Z)(l,r,s,!1,null,null,null),p=d.exports,u=o(5387);n.ZP.config.productionTip=!1,n.ZP.use(o(3411)),n.ZP.use(u.Z.Adsense),new n.ZP({render:t=>t(p)}).$mount("#app")},7383:function(t,e,o){t.exports=o.p+"img/gpt-audiobook-logo.d151748d.png"}},e={};function o(n){var r=e[n];if(void 0!==r)return r.exports;var s=e[n]={exports:{}};return t[n].call(s.exports,s,s.exports,o),s.exports}o.m=t,function(){var t=[];o.O=function(e,n,r,s){if(!n){var i=1/0;for(h=0;h<t.length;h++){n=t[h][0],r=t[h][1],s=t[h][2];for(var a=!0,c=0;c<n.length;c++)(!1&s||i>=s)&&Object.keys(o.O).every((function(t){return o.O[t](n[c])}))?n.splice(c--,1):(a=!1,s<i&&(i=s));if(a){t.splice(h--,1);var l=r();void 0!==l&&(e=l)}}return e}s=s||0;for(var h=t.length;h>0&&t[h-1][2]>s;h--)t[h]=t[h-1];t[h]=[n,r,s]}}(),function(){o.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return o.d(e,{a:e}),e}}(),function(){o.d=function(t,e){for(var n in e)o.o(e,n)&&!o.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})}}(),function(){o.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"===typeof window)return window}}()}(),function(){o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)}}(),function(){o.p="/"}(),function(){var t={143:0};o.O.j=function(e){return 0===t[e]};var e=function(e,n){var r,s,i=n[0],a=n[1],c=n[2],l=0;if(i.some((function(e){return 0!==t[e]}))){for(r in a)o.o(a,r)&&(o.m[r]=a[r]);if(c)var h=c(o)}for(e&&e(n);l<i.length;l++)s=i[l],o.o(t,s)&&t[s]&&t[s][0](),t[s]=0;return o.O(h)},n=self["webpackChunkgpt_audiobook"]=self["webpackChunkgpt_audiobook"]||[];n.forEach(e.bind(null,0)),n.push=e.bind(null,n.push.bind(n))}();var n=o.O(void 0,[998],(function(){return o(7192)}));n=o.O(n)})();
//# sourceMappingURL=app.4b7a54e0.js.map