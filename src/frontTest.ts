import { Pulke } from "./Pulke";

const pulke = new Pulke({
    selector: "#canvas",
    duration: 5000,
    loop: true,
    loopTimes: 0,
    items: [{selector: ".ball", props: [{
        property: "attr:cx",
        unit: "%",
        keyframes: [
            {position: 0, value: -2},
            {position: 1, value: 102}
        ]
    },
    {
        property: "attr:cy",
        keyframes: [
            {position: 0, value: 10, ease: "in-cubic"},
            {position: 0.25, value: 120, ease: "out-cubic"},
            {position: 0.5, value: 40, ease: "in-cubic"},
            {position: 0.75, value: 120, ease: "out-cubic"},
            {position: 1, value: 90, ease: "in-cubic"}
        ],
        unit: "px"
    }
  ]}]
});

pulke.scrub(0.85);
pulke.resume();

document.querySelector("#canvas").addEventListener("click",
    () => console.log(pulke.playing ? pulke.pause() : pulke.resume()));
