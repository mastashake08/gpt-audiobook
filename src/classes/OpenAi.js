import SpeechKit from '@mastashake08/speech-kit'
export default class OpenAi extends EventTarget {

  constructor (apiKey, speechOptions = {}) {
    super()
    this.apiKey = apiKey
    this.sk = new SpeechKit(speechOptions)
    this.baseUrl = 'https://api.openai.com/v1/completions'
    this.books = {}
    this.booksReady = false
    this.currentBook = {}
    this.apiUrl = 'https://gpt-audiobook.jcompsolu.com'
    this.sk.getVoices()
    this.songList = [
      '/scary.mp3',
      '/adventure.mp3',
      '/romantic.mp3'
    ]
  }

  async generateBook (data = {}) {
    try {
      this.dispatchEvent(new CustomEvent('storygenerating', {
        detail: {
          event: event
        }
      }))
      const res = await fetch(this.baseUrl, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      });
      this.books = await res.json()
      this.booksReady = true
      this.currentBook = JSON.parse(this.books.choices[0].text.trim())
      this.dispatchEvent(new CustomEvent('storygenerated', {
        detail: {
          book: this.currentBook
        }
      }))
    } catch (e){
      this.booksReady = false
      this.dispatchEvent(new Event('storygeneratederror'))
    }
  }

  pauseStory () {
    this.sk.pauseSynth()
  }

  stopStory () {
    this.sk.getSynth().cancel()
  }

  async readStory (prompt, genreIndex = 0) {
    const that = this
    try {
      this.addEventListener('speechkitutterancestart', function () {
        this.isPlaying =  true
        console.log('hi')
      })
      this.sk.addEventListener('speechkitspeechend', function () {
        console.log('hi')
        that.isPlaying =  false
        console.log('stop')
        that.dispatchEvent(new CustomEvent('storyreadended',{
          bubbles: true,
          detail: {
            book: this.currentBook
          }
        }))
      })
      const data = { model: "text-davinci-003", prompt: prompt, temperature: 1, max_tokens: 2048}

      await this.generateBook(data)
      if(this.booksReady) {

        this.dispatchEvent(new CustomEvent('storyreadstarted',{
          bubbles: true,
          detail: {
            book: this.currentBook
          }
        }))
        if(typeof this.currentBook.text !== 'undefined') {
          this.sk.speak(this.currentBook.text)
          this.getBgMusic(genreIndex)
          this.saveStory(this.currentBook)
        } else {
          this.sk.speak('ChatGPT is busy right now. Please try again in a few minutes!')
        }



      } else {
        throw new Error('ChatGPT is busy right now. Please try again in a few minutes!')
        }
      } catch (e) {
        try {
          if(typeof this.currentBook.text !== 'undefined') {
            this.sk.speak(this.currentBook.text)
            this.getBgMusic(genreIndex)
            this.saveStory(this.currentBook)
          } else {
            this.sk.speak('ChatGPT is busy right now. Please try again in a few minutes!')
          }
        } catch {
          this.sk.speak('ChatGPT is busy right now. Please try again in a few minutes!')
          this.dispatchEvent(new Event('storyreaderror'))
        }

    }
  }
  async getBgMusic (genreIndex) {

    this.audioContext = new AudioContext()
    this.audio = new Audio(this.songList[genreIndex])
    this.audio.volume = 0.3
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0, 0.1)
    const source = this.audioContext.createMediaElementSource(this.audio);
    source.connect(this.audioContext.destination);

    this.audio.play()
  }


stopBgMusic () {
  this.audio.pause()
}

  convertToText(book) {
    const text = book.text.replace(/<\/?[^>]+(>|$)/g, "")
    return text.trim()
  }

  async saveStory(book) {
    try {
      if(localStorage.books) {
        const books = JSON.parse(localStorage.books)
        books.push(book)
        localStorage.books = JSON.stringify(books)
      } else {
        localStorage.books = JSON.stringify([book])
      }
      await fetch(this.apiUrl + '/api/upload-story', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({data:book}) // body data type must match "Content-Type" header
      })
    } catch (e){
      return e
    }
  }
}
