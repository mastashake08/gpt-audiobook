<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <span v-if="isLoading">
      <h2> Generating Horror Short </h2>
    </span>
    <button @click="generateBook" v-if="readyToGenerate">Generate Horror Short</button>
    <ul v-if="isPlaying">
      <button @click="pauseStory" >Pause</button>
      <button @click="stopStory" >Stop</button>
    </ul>
  </div>
</template>

<script>
import OpenAi from './classes/OpenAi'
export default {
  name: 'App',
  data () {
    return {
      isLoading: false,
      isPlaying: false,
      openAi: {},
      books: [],
      prompt: 'generate a 3 paragraph horror story and output an SSML file prefixing <?xml version="1.0" ?> that is serialized to a string.'
    }
  },
  created () {
    this.openAi = new OpenAi('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', {
      pitch: 0.88,
      rate: 0.88
    })
    this.openAi.onstorygenerated = () => {
      this.isLoading = true
    }
    this.openAi.onspeechkitutterancestarted = (event) => {
      console.log(event)
    }
  },
  computed: {
    readyToGenerate () {
      return !this.isLoading && !this.isPlaying
    }
  },
  methods: {
    pauseStory () {
      this.openAi.pauseStory()
      this.isPlaying = false
    },
    stopStory () {
      this.openAi.stopStory()
      this.isPlaying = false
    },
    resumeStory () {
      this.openAi.resumeStory()
      this.isPlaying = true
    },
     generateBook () {
      const that = this
      that.isLoading = true
      const promise = new Promise(function(resolve, reject) {
      try {
        that.openAi.readStory(that.prompt)
        resolve(); // Yay! Everything went well!
      } catch (e) {
        reject(e)
        }
      })
      promise.then(() => {
        that.isPlaying = true
        that.isLoading = false
      }).catch((e) => {
        alert(e.message)
        that.isPlaying = false
        that.isLoading = false
      })
      return promise
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
