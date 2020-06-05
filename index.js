import { update } from "./utils/scheduleService";
import { humanReadableTime } from "./utils/time";
import { ATTTRIBUTES } from "./utils/constants";

export class ConsuoUpNext extends HTMLElement {
  static get observedAttributes() {
    return [
      ATTTRIBUTES.API_URL,
      ATTTRIBUTES.CHANNEL_ID,
      ATTTRIBUTES.UPDATE_INTERVAL,
    ];
  }

  constructor() {
    super();

    this.schedule = {
      currentEvent: undefined,
      nextEvent: undefined,
    };
  }

  async connectedCallback() {
    this[ATTTRIBUTES.API_URL] = this.getAttribute(ATTTRIBUTES.API_URL);
    this[ATTTRIBUTES.CHANNEL_ID] = this.getAttribute(ATTTRIBUTES.CHANNEL_ID);
    this[ATTTRIBUTES.UPDATE_INTERVAL] = this.getAttribute(
      ATTTRIBUTES.UPDATE_INTERVAL
    );
    /**
     * Call fetch data if we have the correct attributes
     */
    this.refresh();
  }

  style() {
    let styleExist = this.querySelector("style");
    if (styleExist) return;
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
    let container = this.querySelector(".consuo-epg-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "consuo-up-next-container";
    } else {
      container.innerHTML = "";
    }

    if (this.schedule.currentEvent) {
      container.innerHTML += this.renderCurrentEvent();
    }
    if (this.schedule.nextEvent) {
      container.innerHTML += this.renderNextEvent();
    }
    this.appendChild(container);
    this.style();
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

  async refresh() {
    /**
     * If a scheduler is set up since before, delete it since we will create a new one if the interval has changed
     */
    if (this.scheduleUpdater) {
      clearInterval(this.scheduleUpdater);
    }

    /**
     * If we have the api url and channel id we can at least do a single schedule call
     */
    if (this[ATTTRIBUTES.API_URL] && this[ATTTRIBUTES.CHANNEL_ID]) {
      this.schedule = await update(
        this[ATTTRIBUTES.API_URL],
        this[ATTTRIBUTES.CHANNEL_ID]
      );
      this.render();
      /**
       * If we have an interval specified as well, we can set it up to refresh the schedule
       */
      if (this[ATTTRIBUTES.UPDATE_INTERVAL]) {
        this.scheduleUpdater = setInterval(async () => {
          this.schedule = await update(
            this[ATTTRIBUTES.API_URL],
            this[ATTTRIBUTES.CHANNEL_ID]
          );
          this.render();
        }, this[ATTTRIBUTES.UPDATE_INTERVAL] * 1000);
      }
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    /**
     * Set the internal property to the new attribute value
     */
    this[name] = newValue;
    /**
     * Only refresh if we do not go from null, since that will happen in the setup
     */
    if (oldValue) {
      this.refresh();
    }
  }

  disconnectedCallback() {
    clearInterval(this.scheduleUpdater);
  }
}
customElements.define("consuo-up-next", ConsuoUpNext);
