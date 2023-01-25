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
      console.log(JSON.parse(this.books.choices[0].text.trim()))
      this.currentBook = JSON.parse(this.books.choices[0].text.trim())
      console.log(this.currentBook)
      this.dispatchEvent(new CustomEvent('storygenerated', {
        detail: {
          book: this.currentBook
        }
      }))
    } catch (e){
      console.log(e)
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
      this.sk.addEventListener('speechkitutterancestart', function (event) {
        console.log(event)
        this.isPlaying =  true
      })
      this.sk.addEventListener('speechkitutteranceend', function (event) {
        console.log(event)
        this.isPlaying =  false
        this.dispatchEvent(new CustomEvent('storyreadended',{
          bubbles: true,
          detail: {
            book: this.currentBook
          }
        }))
      })
      const data = { model: "text-davinci-003", prompt: prompt, temperature: 0.95, max_tokens: 1200}

      await this.generateBook(data)
      if(this.booksReady) {

        this.dispatchEvent(new CustomEvent('storyreadstarted',{
          bubbles: true,
          detail: {
            book: this.currentBook
          }
        }))
        this.saveStory(this.currentBook)
        this.sk.speak(this.currentBook.ssml)


      } else {
        throw new Error('ChatGPT is busy right now. Please try again in a few minutes!')
        }
      } catch (e) {
        try {
          this.sk.speak(this.currentBook.text)
        } catch (e) {
          alert(e.message)
          this.dispatchEvent(new Event('storyreaderror'))
        }

    }
  }

  convertToText(book) {
    const text = book.text.replace(/<\/?[^>]+(>|$)/g, "")
    return text.trim()
  }

  async saveStory(book) {
    try {
      console.log(book)
      if(localStorage.books !== null) {
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
      console.log(e)
      return e
    }
  }
}
