<template>
  <div id="app">
    <img alt="GPT Audiobook logo" height="256px" width="256px" src="./assets/gpt-audiobook-logo.png">
    <span>
      <h2 v-if="loading"> Generating AI Short Story</h2>
      <h2 v-else> AI Generated Audiobooks </h2>
    </span>
    <br/>
    <div>
      <label for="genre-select">Select A Genre</label>
      <br/>
      <select v-model="genre" id="genre-select">
        <option v-for="(g, index) in genres" :key="index" :value="g"> {{g}} </option>
      </select>
    </div>
    <div>
      <label for="length-select">Select A Story Length</label>
      <br/>
      <select v-model="length" id="length-select">
        <option v-for="(l, index) in lengths" :key="index" :value="l"> {{l}} </option>
      </select>
    </div>
    <br/>
    <div>
      <label for="story-prompt">Seed story with a prompt, or leave blank for total AI creativity:</label>
      <br/>
      <textarea id="story-prompt" name="story" rows="5" cols="33" v-model="userIdea">
      </textarea>
    </div>
    <br/>
    <div>
    <button @click="generateBook" v-if="readyToGenerate">Generate Horror Short</button>
    <ul v-if="isPlaying">
      <button @click="pauseStory" >Pause</button>
      <button @click="stopStory" >Stop</button>
    </ul>
  </div>
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
      currentBook: {},
      userIdea: '',
      genre: 'Horror',
      genres: ['Horror', 'Comedy', 'Love', 'Murder Mystery', 'Sci-Fi'],
      lengths: ['2 sentence', '1 paragraph', '2 paragraph', '3 paragraph','4 paragraph','5 paragraph','6 paragraph','7 paragraph','8 paragraph','9 paragraph','10 paragraph'],
      length: '2 sentence'
    }
  },
  async created () {
    const res = await fetch('https://gpt-audiobook.jcompsolu.com/api/get-key')
    const json = await res.json()
    this.openAi = new OpenAi(json.token, {
      pitch: 0.88,
      rate: 0.88
    })
    this.openAi.addEventListener('storygenerating', function (event) {
      console.log(event)
    })
    this.openAi.addEventListener('storygenerated', function (event) {
      console.log(event)
      this.isLoading = false
      this.currentBook = event.detail.book
    })
    this.openAi.addEventListener('speechkitutterancestarted', function(event) {
      console.log(event)
    })
    this.openAi.addEventListener('storyreadended', function(event) {
      this.isPlaying = false
      this.isLoading = false
      console.log(event)
    })
  },
  computed: {
    readyToGenerate () {
      return !this.isLoading && !this.isPlaying
    },
    loading () {
      return this.isLoading
    },
    prompt () {
      if(this.userIdea != '') {
        return `generate a ${this.length} ${this.genre} story based on ${this.userIdea} with a title. Return a well formatted JSON object with a title property that contains the title, a text property that contains the story and ssml property that contains an well formatted SSML file prefixing <?xml version="1.0" ?> generated from the story. Serialized the JSON object as a string.`
      } else {
        return `generate a ${this.length} ${this.genre} story with a title. Return a well formatted JSON object with a title property that contains the title, a text property that contains the story and ssml property that contains an well formatted SSML file prefixing <?xml version="1.0" ?> generated from the story. Serialized the JSON object as a string.`
      }
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
      this.isLoading = true
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
      }).catch(() => {
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
