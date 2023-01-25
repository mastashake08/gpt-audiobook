import SpeechKit from '@mastashake08/speech-kit'
export default class OpenAi extends EventTarget {

  constructor (apiKey, speechOptions = {}) {
    super()
    this.apiKey = apiKey
    this.sk = new SpeechKit(speechOptions)
    this.bookSSML = null
    this.baseUrl = 'https://api.openai.com/v1/completions'
    this.books = {}
    this.booksReady = false
  }

  async generateBook (data = {}) {
    try {
      const res = await fetch(this.baseUrl, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      });
      this.books = await res.json()
      this.saveStory(this.books.choices[0])
      this.booksReady = true
      this.dispatchEvent(new Event('storygenerated'))
    } catch (e) {
      alert(e.message)
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

  async readStory (prompt) {
    try {
      this.addEventListener('onspeechkitutterencestart', function () {
        this.isPlaying =  true
      })
      this.addEventListener('onspeechkitutterenceend', function () {
        this.isPlaying =  false
      })
      const data = { model: "text-davinci-003", prompt: prompt, temperature: 0.9, max_tokens: 500}
      await this.generateBook(data)
      if(this.booksReady) {
        const ssml = this.books.choices[0].text.trim()
        this.sk.speak(ssml)
        this.dispatchEvent(new Event('storyreadgenerated'))
      } else {
        throw new Error('ChatGPT is busy right now. Please try again in a few minutes!')
        }
      } catch (e) {
      alert(e.message)
      this.dispatchEvent(new Event('storyreaderror'))
    }
  }

  convertToText(book) {
    const text = book.text.replace(/<\/?[^>]+(>|$)/g, "")
    return text.trim()
  }

  saveStory(book) {
    try {
      if(localStorage.books !== null) {
        const books = JSON.parse(localStorage.books)
        books.push(book)
        localStorage.books = JSON.stringify(books)
      } else {
        localStorage.books = JSON.stringify([book])
      }
    } catch (e) {
      console.log(e)
      return
    }
  }
}
