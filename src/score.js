export class Score {
  #value = 0

  constructor(initialValue) {
    this.#value = initialValue
  }

  get value() {
    return this.#value
  }

  set value(v) {
    this.#value = v
    document.getElementById('score-val').innerText = this.#value.toString()
  }
}
