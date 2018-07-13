import { Pulke } from "./Pulke";

const pulke = new Pulke({
    selector: "#canvas",
    duration: 5000,
    loop: true,
    loopTimes: 0,
    items: [{selector: ".ball", props: [{
        property: "style:left",
        unit: "%",
        keyframes: [
            {position: 0, value: -10},
            {position: 1, value: 110}
        ]
    },
    {
        property: "style:top",
        ease: "in-cubic",
        keyframes: [
            {position: 0, value: 10, ease: "in-cubic"},
            {position: 0.25, value: 90, ease: "out-cubic"},
            {position: 0.5, value: 40, ease: "in-cubic"},
            {position: 0.75, value: 90, ease: "out-cubic"},
            {position: 1, value: 70, ease: "in-cubic"}
        ],
        unit: "%"
    }
  ]}, {
    selector: ".textbox", props: [{
      property: "text:",
      keyframes: [
        {position: 0, value: "First quarter"},
        {position: 0.25, value: "Second quarter"},
        {position: 0.5, value: "Third quarter"},
        {position: 0.75, value: "Last quarter"}
      ]
    }, {
      property: "style:background-color",
      ease: "linear",
      keyframes: [
        {position: 0, value: "#ff0000"},
        {position: 0.333, value: "#00ff00"},
        {position: 0.666, value: "#0000ff"},
        {position: 1, value: "#ff0000"}
      ]
    }]
  }]
});

pulke.scrub(0.85);
pulke.resume();

document.querySelector("#canvas").addEventListener("click",
    () => console.log(pulke.playing ? pulke.pause() : pulke.resume()));
