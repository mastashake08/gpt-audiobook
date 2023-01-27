<template>
  <div id="app">
    <img alt="GPT Audiobook logo" height="256px" width="256px" src="./assets/gpt-audiobook-logo.png">
    <span>
      <Adsense
       style="display:block"
       data-ad-client="ca-pub-7023023584987784"
       data-ad-slot="2698286691"
       data-ad-format="auto"
       data-full-width-responsive="true">
      </Adsense>
      <h2 v-if="loading"> Generating AI Short Story</h2>
      <h2 v-else> AI Generated Audiobooks </h2>
      <p>
        Welcome to GPT Audiobooks, created by <a href="https://jyroneparker.com">Jyrone Parker</a>
        These are audiobooks that are generated with ChatGPT artificial intelligence and read back to you using the Web Speech API.

        To get started:
      
          Input a <a href="#genre-select">genre</a> you want to create
           Input a <a href="#length-select">story length</a>
           Input a <a href="#story-prompt">story prompt</a>. This is optional, leaving it blank will instruct AI to be totally creative!
           Select <a href="#voice-select">voice to read</a>. This is optional, leaving it blank will use system default voice.
           Select a <a href="#music-select">background music track.</a>. This is optional, leaving it blank will use a random track.
           Click the  <a href="#generate-book">generate story</a> button, give ChatGPT some time and enjoy!

      </p>
    </span>
    <br/>
    <div>
      <label for="genre-select">Type A Genre</label>
      <br/>
      <input type="text" id="genre-select" v-model="genre" list="genres" />
        <datalist id="genres">
          <option v-for="(g, index) in genres" :key="index" :value="g"> {{g}} </option>
        </datalist>
    </div>
    <br />
    <div>
      <label for="length-select">Type A Story Length</label>
      <br/>
      <input type="text" id="length-select" v-model="length" list="lengths" />
        <datalist id="lengths">
          <option v-for="(l, index) in lengths" :key="index" :value="l"> {{l}} </option>
        </datalist>
    </div>
    <br/>
    <div>
      <label for="story-prompt">Seed story with a prompt, or leave blank for total AI creativity:</label>
      <br/>
      <textarea id="story-prompt" name="story" rows="5" cols="33" v-model="userIdea">
      </textarea>
    </div>
    <div>
      <label for="genre-select">Select A Voice</label>
      <br/>
      <select name="voices" id="voice-select"  :value="selectedVoiceIndex" @change="setVoice($event)">
        <option disabled value="-1">Select Voice</option>
          <option v-for="(voice, index) in voices" :key="index" :value="index" >{{voice.name}} - {{voice.lang}}</option>
      </select>
    </div>
    <div>
      <label for="music-select" >Select Background Music</label>
      <br/>
      <select name="music" id="music-select"  :value="selectedMusicIndex" @change="setMusic($event)">
        <option disabled value="-1">Select Background Music</option>
          <option v-for="(m, index) in music" :key="index" :value="index" >{{m}}</option>
      </select>
    </div>
    <br/>
    <div>
    <ul>
      <button @click="generateBook" v-if="readyToGenerate" id="generate-book">Generate {{genre}} Story</button>
      <button @click="stopStory" v-else>Stop</button>
    </ul>
      {{getStoryText}}
  </div>
  <Adsense
    data-ad-client="ca-pub-7023023584987784"
    data-ad-slot="6833537473"
    data-ad-format="auto"
    data-full-width-responsive="true">
  </Adsense>
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
      selectedVoiceIndex: -1,
      selectedVoice: {},
      selectedMusicIndex: 0,
      userIdea: '',
      genre: '',
      genres: ['Horror', 'Comedy', 'Love', 'True Crime', 'Sci-Fi', 'Fantasy', 'History', 'Action', 'Politics', 'Spirituality', 'Prose', 'Western', 'Legend', 'Erotica'],
      lengths: ['2 sentence', '1 paragraph', '2 paragraph', '3 paragraph','4 paragraph','5 paragraph','6 paragraph','7 paragraph','8 paragraph','9 paragraph','10 paragraph'],
      length: '',
      voices: [],
      music: ['Scary','Adventure', 'Romantic'],
      storyText: ''
    }
  },
  mounted () {
    setTimeout(() => {
      this.voices = this.openAi.sk.getVoices()
      this.selectedVoice = this.voices[0]
    }, "1000")
  },
  async created () {
    const res = await fetch('https://gpt-audiobook.jcompsolu.com/api/get-key')
    const json = await res.json()
    this.openAi = new OpenAi(json.token, {
      pitch: 0.88,
      rate: 0.80
    })
    const that = this
    this.openAi.addEventListener('storygenerating', function () {
      that.isLoading = true
    })
    this.openAi.addEventListener('storygenerated', function (event) {
      that.isLoading = false
      that.storyText = event.detail.book.text
      that.currentBook = event.detail.book
      console.log(that.currentBook)

    })
    this.openAi.addEventListener('speechkitutterancestarted', function() {
      that.isPlaying = true
    })
    this.openAi.sk.synth.addEventListener('end', function() {
      that.isPlaying = false
      that.isLoading = false
    })
  },
  computed: {
    readyToGenerate () {
      return !this.isLoading && !this.isPlaying
    },
    loading () {
      return this.isLoading
    },
    playing () {
      return this.isPlaying
    },
    getIdea () {
      return this.userIdea
    },
    prompt () {
      if(this.getIdea != '') {
        return `generate a ${this.length} ${this.genre} story based on ${this.userIdea} with a title. Return a well formatted JSON object with a title property that contains the title, a text property that contains the story and ssml property that contains an well formatted SSML file prefixing <?xml version="1.0" ?><speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis"
        xml:lang="en-US"> generated from the story. Serialized the JSON object as a string.`
      } else {
        return `generate a ${this.length} ${this.genre} story with a title. Return a well formatted JSON object with a title property that contains the title, a text property that contains the story and ssml property that contains an well formatted SSML file prefixing <?xml version="1.0" ?><speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis"
       xml:lang="en-US"> generated from the story. Serialized the JSON object as a string.`
      }
    },
    getStoryText () {
      return this.storyText
    }
  },
  methods: {
    setVoice (e) {
      this.selectedVoiceIndex = e.target.value
      this.selectedVoice = this.voices[this.selectedVoiceIndex]
      this.openAi.sk.setSpeechVoice(this.selectedVoice)
    },
    setMusic (e) {
      this.selectedMusicIndex = e.target.value
    },
    pauseStory () {
      this.openAi.pauseStory()
      this.isPlaying = false
    },
    stopStory () {
      this.openAi.stopStory()
      this.isPlaying = false
      this.isLoading = false
      this.openAi.stopBgMusic()
      this.storyText = ""
    },
    resumeStory () {
      this.openAi.resumeStory()
      this.isPlaying = true
    },
     generateBook () {
      const that = this
      this.isLoading = true
      this.storyText = "Generating story, please give ChatGPT a few minutes to work."
      const promise = new Promise(function(resolve, reject) {
      try {
        that.openAi.readStory(that.prompt, that.selectedMusicIndex)
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
