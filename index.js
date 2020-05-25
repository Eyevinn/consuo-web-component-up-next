import { update } from "./utils/scheduleService";
import { humanReadableTime } from "./utils/time";

export class ConsuoUpNext extends HTMLElement {
  static get observedAttributes() {
    return ["apiUrl", "channelId", "updateInterval"];
  }

  constructor() {
    super();

    this.schedule = {
      currentEvent: undefined,
      nextEvent: undefined,
    };
  }

  async connectedCallback() {
    this.apiUrl = this.getAttribute("apiUrl");
    this.channelId = this.getAttribute("channelId");
    this.updateInterval = this.getAttribute("updateInterval");

    this.style();
    this.update();
  }

  style() {
    const style = document.createElement("style");
    style.innerHTML = `
      div.consuo-up-next-container {
        box-sizing: border-box;
        width: 100%;
        height: 600px;
        padding: 30px;
        box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
        font-family: Helvetica;
      }

      .consuo-now p {
        margin-bottom: -22px;
      }

      .consuo-now h2 {
        font-size: 1.6rem;
      }
    `;
    this.appendChild(style);
  }

  render() {
    this.innerHTML = "";
    const container = document.createElement("div");
    container.className = "consuo-up-next-container";

    if (this.schedule.currentEvent) {
      container.innerHTML += this.renderCurrentEvent();
    }
    if (this.schedule.nextEvent) {
      container.innerHTML += this.renderNextEvent();
    }
    this.appendChild(container);
  }

  renderCurrentEvent() {
    let startTime = humanReadableTime(this.schedule.currentEvent.start_time);
    let endTime = humanReadableTime(this.schedule.currentEvent.end_time);
    const currentEventHtml = `
    <div class="consuo-now">
      <p>${startTime} - ${endTime}</p>
      <h2>Now: ${this.schedule.currentEvent.title}</h2>
    </div>
    `;
    return currentEventHtml;
  }

  renderNextEvent() {
    let startTime = humanReadableTime(this.schedule.nextEvent.start_time);
    let endTime = humanReadableTime(this.schedule.nextEvent.end_time);
    const nextEventHtml = `
    <div class="consuo-next">
      <p>Next: ${this.schedule.nextEvent.title} ${startTime} - ${endTime}</p>
    </div>
    `;
    return nextEventHtml;
  }

  async update() {
    if (this.scheduleUpdater) {
      clearInterval(this.scheduleUpdater);
    }
    if (this.apiUrl && this.channelId) {
      this.schedule = await update(this.apiUrl, this.channelId);
      this.render();
      if (this.updateInterval) {
        this.scheduleUpdater = setInterval(async () => {
          this.schedule = await update(this.apiUrl, this.channelId);
          this.render();
        }, this.updateInterval * 1000);
      }
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue;
    this.update();
  }

  disconnectedCallback() {
    clearInterval(this.scheduleUpdater);
  }
}
customElements.define("consuo-up-next", ConsuoUpNext);