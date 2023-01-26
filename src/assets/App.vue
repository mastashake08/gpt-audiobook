<template>
  <div id="app">
    <img alt="GPT Audiobook logo" height="256px" width="256px" src="./assets/gpt-audiobook-logo.png">
    <span>
      <h2 v-if="loading"> Generating AI Short Story</h2>
      <h2 v-else> AI Generated Audiobooks </h2>
      <Adsense
       style="display:block"
       data-ad-client="ca-pub-7023023584987784"
       data-ad-slot="2698286691"
       data-ad-format="auto"
       data-full-width-responsive="true">
      </Adsense>
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
      <label for="music-select">Select Background Music</label>
      <br/>
      <select name="music" id="music-select"  :value="selectedMusicIndex">
        <option disabled value="-1">Select Background Music</option>
          <option v-for="(m, index) in music" :key="index" :value="index" >{{m}}</option>
      </select>
    </div>
    <br/>
    <div>
    <ul>
      <button @click="generateBook" v-if="readyToGenerate">Generate {{genre}} Story</button>
      <button @click="stopStory" v-else>Stop</button>
    </ul>
      {{this.currentBook.text}}
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
      currentBook: {
        text: ''
      },
      selectedVoiceIndex: -1,
      selectedVoice: {},
      selectedMusicIndex: -1,
      userIdea: '',
      genre: '',
      genres: ['Horror', 'Comedy', 'Love', 'True Crime', 'Sci-Fi', 'Fantasy', 'History', 'Action', 'Politics', 'Spirituality', 'Prose', 'Western', 'Legend', 'Erotica'],
      lengths: ['2 sentence', '1 paragraph', '2 paragraph', '3 paragraph','4 paragraph','5 paragraph','6 paragraph','7 paragraph','8 paragraph','9 paragraph','10 paragraph'],
      length: '',
      voices: [],
      music: ['Scary','Adventure', 'Romantic']
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
    this.openAi.addEventListener('storygenerating', function () {
      this.isLoading = true
    })
    this.openAi.addEventListener('storygenerated', function (event) {
      this.isLoading = false
      this.currentBook = event.detail.book

    })
    this.openAi.addEventListener('speechkitutterancestarted', function() {
      this.isPlaying = true
    })
    this.openAi.sk.synth.addEventListener('end', function() {
      this.isPlaying = false
      this.isLoading = false
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
    prompt () {
      if(this.userIdea != '') {
        return `generate a ${this.length} ${this.genre} story based on ${this.userIdea} with a title. Return a well formatted JSON object with a title property that contains the title, a text property that contains the story and ssml property that contains an well formatted SSML file prefixing <?xml version="1.0" ?> generated from the story. Serialized the JSON object as a string.`
      } else {
        return `generate a ${this.length} ${this.genre} story with a title. Return a well formatted JSON object with a title property that contains the title, a text property that contains the story and ssml property that contains an well formatted SSML file prefixing <?xml version="1.0" ?> generated from the story. Serialized the JSON object as a string.`
      }
    },
    storyText () {
      return this.currentBook.text
    }
  },
  methods: {
    setVoice (e) {
      this.selectedIndex = e.target.value
      this.selectedVoice = this.voices[this.selectedIndex]
      this.openAi.sk.setSpeechVoice(this.selectedVoice)
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
